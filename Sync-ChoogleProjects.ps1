<#
.SYNOPSIS
    Automated Project Synchronizer for Choogle Apps & Search Index.
.DESCRIPTION
    Scans g:\My Drive\Antigravity\Projects for newly created and existing projects.
    Detects runnable web apps and project tools, and automatically registers them:
      1. As interactive app launcher cards in Choogle's apps dropdown (index.html).
      2. As indexed keywords and knowledge cards in Choogle's search data (search-data.js).
    Supports scheduled daily cron execution at 00:05 (12:05 AM).
#>

[CmdletBinding()]
param(
    [switch]$Force
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$Utf8Encoding = [System.Text.UTF8Encoding]::new($false)

$ChoogleDir = $PSScriptRoot
$ProjectsDir = Split-Path -Path $ChoogleDir -Parent
$IndexHtmlPath = Join-Path -Path $ChoogleDir -ChildPath "index.html"
$SearchDataJsPath = Join-Path -Path $ChoogleDir -ChildPath "search-data.js"
$MetadataPath = Join-Path -Path $ChoogleDir -ChildPath "projects-metadata.json"
$LogFile = Join-Path -Path $ChoogleDir -ChildPath "choogle_sync_log.txt"

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")
$logHeader = "[$timestamp] Starting Choogle project synchronization check..."
[System.IO.File]::AppendAllText($LogFile, "$logHeader`r`n", $Utf8Encoding)
Write-Host $logHeader -ForegroundColor Cyan

if (-not (Test-Path $IndexHtmlPath)) {
    Write-Error "Could not locate Choogle index.html at $IndexHtmlPath"
    return
}

# Load Known projects metadata from JSON
$KnownProjects = @{}
if (Test-Path $MetadataPath) {
    $rawMeta = [System.IO.File]::ReadAllText($MetadataPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
    foreach ($prop in $rawMeta.PSObject.Properties) {
        $KnownProjects[$prop.Name] = @{
            Name = $prop.Value.Name
            Icon = $prop.Value.Icon
            Title = $prop.Value.Title
            Entry = $prop.Value.Entry
            SearchKeys = @($prop.Value.SearchKeys)
            Snippet = $prop.Value.Snippet
        }
    }
}

# Scan Projects directory for folders
$projectFolders = Get-ChildItem -Path $ProjectsDir -Directory | Where-Object {
    $_.Name -ne "Choogle" -and $_.Name -notmatch '^\.'
}

$appsToAdd = @()
$searchesToAdd = @()

$htmlContent = [System.IO.File]::ReadAllText($IndexHtmlPath, [System.Text.Encoding]::UTF8)
$searchJsContent = if (Test-Path $SearchDataJsPath) { [System.IO.File]::ReadAllText($SearchDataJsPath, [System.Text.Encoding]::UTF8) } else { "" }

foreach ($folder in $projectFolders) {
    $folderName = $folder.Name
    $folderPath = $folder.FullName

    $appMeta = $null
    if ($KnownProjects.ContainsKey($folderName)) {
        $appMeta = $KnownProjects[$folderName]
    } else {
        # Auto-heuristic for brand new project folder
        $entryRel = $null
        $htmlFiles = Get-ChildItem -Path $folderPath -Recurse -Filter "*.html" -File -ErrorAction SilentlyContinue | Where-Object {
            $_.FullName -notmatch '\\(\.venv|bin|obj|node_modules)\\'
        }

        if ($htmlFiles) {
            $preferred = $htmlFiles | Where-Object { $_.Name -eq "index.html" } | Select-Object -First 1
            if (-not $preferred) { $preferred = $htmlFiles | Select-Object -First 1 }
            $relSub = $preferred.FullName.Substring($folderPath.Length).TrimStart('\', '/') -replace '\\', '/'
            $entryRel = "../$folderName/$relSub"
        } elseif (Test-Path (Join-Path $folderPath "README.md")) {
            $entryRel = "../$folderName/README.md"
        }

        if (-not $entryRel) { continue }

        # Derive name & icon safely
        $cleanName = ($folderName -replace '[-_]', ' ').Trim()
        $words = $cleanName.Split(' ')
        $shortName = if ($words.Count -gt 2) { "$($words[0]) $($words[1])" } else { $cleanName }
        if ($shortName.Length -gt 13) { $shortName = $shortName.Substring(0, 12) + "..." }

        $icon = [char]::ConvertFromUtf32(0x1F680)
        if ($cleanName -match "game|play") { $icon = [char]::ConvertFromUtf32(0x1F3AE) }
        elseif ($cleanName -match "ai|bot|agent") { $icon = [char]::ConvertFromUtf32(0x1F916) }
        elseif ($cleanName -match "security|auth|guard") { $icon = [char]::ConvertFromUtf32(0x1F6E1) + [char]0xFE0F }
        elseif ($cleanName -match "learn|edu|exam|study") { $icon = [char]::ConvertFromUtf32(0x1F4DA) }
        elseif ($cleanName -match "tool|manager|util") { $icon = [char]::ConvertFromUtf32(0x2699) + [char]0xFE0F }

        $appMeta = @{
            Name = $shortName
            Icon = $icon
            Title = $cleanName
            Entry = $entryRel
            SearchKeys = @($cleanName.ToLower())
            Snippet = "Interactive web tool and application created in Antigravity Projects."
        }
    }

    # Check if this app is already in Choogle index.html
    $escapedEntry = [regex]::Escape($appMeta.Entry)
    if ($htmlContent -notmatch $escapedEntry) {
        $appsToAdd += $appMeta
    }

    # Check if search entry is already in search-data.js
    if ($searchJsContent) {
        $primaryKey = $appMeta.SearchKeys[0]
        if ($searchJsContent -notmatch "`"$primaryKey`":") {
            $searchesToAdd += $appMeta
        }
    }
}

Write-Host "Apps discovered needing addition to Choogle: $($appsToAdd.Count)" -ForegroundColor Yellow
Write-Host "Search entries needing addition to Choogle: $($searchesToAdd.Count)" -ForegroundColor Yellow

# 1. Update index.html if new apps detected
if ($appsToAdd.Count -gt 0) {
    # Generate HTML snippet
    $appSnippet = "`r`n"
    foreach ($app in $appsToAdd) {
        $appSnippet += @"
          <a href="$($app.Entry)" target="_blank" class="app-item" title="$($app.Title)">
            <span class="app-icon">$($app.Icon)</span>
            <span class="app-name">$($app.Name)</span>
          </a>`r`n
"@
    }

    # Insert before the closing </div> of apps-grid
    if ($htmlContent -match '(<div class="apps-grid">[\s\S]*?)(</div>\s*</div>\s*<!-- User Profile Button -->)') {
        $htmlContent = $htmlContent -replace '(<div class="apps-grid">[\s\S]*?)(</div>\s*</div>\s*<!-- User Profile Button -->)', ('$1' + $appSnippet + '        $2')
        [System.IO.File]::WriteAllText($IndexHtmlPath, $htmlContent, $Utf8Encoding)
        Write-Host "[SUCCESS] Added $($appsToAdd.Count) new app launcher(s) to Choogle index.html!" -ForegroundColor Green
        [System.IO.File]::AppendAllText($LogFile, "[$timestamp] [HTML] Added $($appsToAdd.Count) apps: $( ($appsToAdd | ForEach-Object { $_.Name }) -join ', ' )`r`n", $Utf8Encoding)
    } else {
        Write-Warning "Could not find apps-grid injection target in index.html"
    }
} else {
    Write-Host "[OK] Choogle apps dropdown is already up to date with all projects." -ForegroundColor Green
}

# 2. Update search-data.js if new searches detected
if ($searchesToAdd.Count -gt 0 -and $searchJsContent) {
    $searchEntriesSnippet = ""
    foreach ($app in $searchesToAdd) {
        foreach ($key in $app.SearchKeys) {
            if ($searchJsContent -notmatch "`"$key`":") {
                $searchEntriesSnippet += @"
    "$key": [
      {
        title: "$($app.Title)",
        url: "$($app.Entry)",
        displayedUrl: "$($app.Entry)",
        snippet: "$($app.Snippet)"
      }
    ],`r`n
"@
            }
        }
    }

    if ($searchEntriesSnippet) {
        if ($searchJsContent -match '(results:\s*\{[\s\S]*?)(\r?\n\s*};\s*\r?\n\s*// Search execution function|};\s*\r?\n\s*function searchData)') {
            $searchJsContent = $searchJsContent -replace '(results:\s*\{[\s\S]*?)(\r?\n\s*};)', ('$1' + "`r`n" + $searchEntriesSnippet + '  };')
            [System.IO.File]::WriteAllText($SearchDataJsPath, $searchJsContent, $Utf8Encoding)
            Write-Host "[SUCCESS] Added $($searchesToAdd.Count) project search definitions to search-data.js!" -ForegroundColor Green
            [System.IO.File]::AppendAllText($LogFile, "[$timestamp] [SEARCH] Added search mappings for: $( ($searchesToAdd | ForEach-Object { $_.Name }) -join ', ' )`r`n", $Utf8Encoding)
        } elseif ($searchJsContent -match '("chase webapps":\s*\[)') {
            $searchJsContent = $searchJsContent -replace '("chase webapps":\s*\[)', ($searchEntriesSnippet + '    $1')
            [System.IO.File]::WriteAllText($SearchDataJsPath, $searchJsContent, $Utf8Encoding)
            Write-Host "[SUCCESS] Added $($searchesToAdd.Count) project search definitions to search-data.js (before chase webapps)!" -ForegroundColor Green
            [System.IO.File]::AppendAllText($LogFile, "[$timestamp] [SEARCH] Added search mappings for: $( ($searchesToAdd | ForEach-Object { $_.Name }) -join ', ' )`r`n", $Utf8Encoding)
        }
    }
} else {
    Write-Host "[OK] Choogle search index is already up to date." -ForegroundColor Green
}

$completeMsg = "[$timestamp] Choogle project synchronization check completed successfully."
[System.IO.File]::AppendAllText($LogFile, "$completeMsg`r`n--------------------------------------------------------------------------------`r`n", $Utf8Encoding)
Write-Host "`n$completeMsg" -ForegroundColor Cyan
