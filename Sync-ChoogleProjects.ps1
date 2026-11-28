<#
.SYNOPSIS
    Automated Project Synchronizer for Choogle Browser 2.0 Registry & Search Index.
.DESCRIPTION
    Scans the parent Antigravity Projects directory for projects, deduplicates entries,
    resolves each project's best HTML/Markdown entrypoint, assigns bespoke vector icon IDs
    (zero emojis), writes projects-registry.json, and cleanly updates search-data.js.
#>

[CmdletBinding()]
param(
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ScriptDir) { $ScriptDir = $PSScriptRoot }
Set-Location -Path $ScriptDir

try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $OutputEncoding = [System.Text.Encoding]::UTF8
} catch {
    # Ignore console encoding error in non-interactive hosts
}

$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$ProjectsDir = Split-Path -Path $ScriptDir -Parent
$RegistryPath = Join-Path -Path $ScriptDir -ChildPath 'projects-registry.json'
$MetadataPath = Join-Path -Path $ScriptDir -ChildPath 'projects-metadata.json'
$SearchDataJsPath = Join-Path -Path $ScriptDir -ChildPath 'search-data.js'
$LogFile = Join-Path -Path $ScriptDir -ChildPath 'choogle_sync_log.txt'

function Write-SyncLog {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Message)
    $ts = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz')
    $line = "[$ts] $Message"
    [System.IO.File]::AppendAllText($LogFile, "$line`r`n", $Utf8NoBom)
    Write-Output $line
}

function ConvertTo-ProjectSlug {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Text)
    $slug = $Text.ToLowerInvariant() -replace '[^a-z0-9]+', '-'
    return $slug.Trim('-')
}

function ConvertTo-ChoogleProjectsUrl {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$RelativeFromProjects)
    $parts = ($RelativeFromProjects -replace '\\', '/').Split('/') | Where-Object { $_ -ne '' }
    $encoded = foreach ($p in $parts) { [System.Uri]::EscapeDataString($p) }
    return 'choogle://projects/' + ($encoded -join '/')
}

function Resolve-ProjectClassification {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$FolderName,
        [string]$Title = '',
        [string]$Snippet = ''
    )

    $haystack = "$FolderName $Title $Snippet".ToLowerInvariant()

    if ($haystack -match 'security|vuln|sentinel|bot finder|rageshield|spam|defense|hack|comptia|sy0-701|firewall|audit') {
        return @{ Category = 'security'; CategoryLabel = 'Security & Defense'; IconId = 'cat-security' }
    }
    if ($haystack -match 'chess|monopoly|game|arcade|mod|rom|emulator|water slide|chancenvaders|basketball|sandbox|planetarium') {
        return @{ Category = 'games'; CategoryLabel = 'Games & Sims'; IconId = 'cat-game' }
    }
    if ($haystack -match '\bvr\b|3d|shader|motion|foldscape') {
        return @{ Category = 'games'; CategoryLabel = '3D & Spatial'; IconId = 'cat-vr' }
    }
    if ($haystack -match '\bai\b|agent|ollama|gemini|llm|neon|orchestrator|assistant|slop|train your ai') {
        return @{ Category = 'ai'; CategoryLabel = 'AI & Agents'; IconId = 'cat-ai' }
    }
    if ($haystack -match 'aws|docker|openshift|cloud|deploy') {
        return @{ Category = 'systems'; CategoryLabel = 'Cloud & Infra'; IconId = 'cat-cloud' }
    }
    if ($haystack -match 'rhcsa|rhel|linux|vmware|ccna|windows event|scheduled task|inspect my pc|improve gaming pc|script|mcp|github|reverse engineer|plugin|chrome tab|baseline') {
        if ($haystack -match 'github|script|mcp|reverse|plugin|chrome|baseline|portfolio|opensource') {
            return @{ Category = 'systems'; CategoryLabel = 'Developer Tools'; IconId = 'cat-code' }
        }
        return @{ Category = 'systems'; CategoryLabel = 'Systems & Labs'; IconId = 'cat-systems' }
    }
    if ($haystack -match 'media|player|sona|music|youtube|video|onestop|flow|anime|image|screensaver|aac|social') {
        return @{ Category = 'media'; CategoryLabel = 'Media & Audio'; IconId = 'cat-media' }
    }
    if ($haystack -match 'stock|trade|home value|synergize|deal|pay|rea\b|monetiz') {
        return @{ Category = 'utilities'; CategoryLabel = 'Finance & Markets'; IconId = 'cat-finance' }
    }
    if ($haystack -match 'fold|zfold|mobile|foldnav') {
        return @{ Category = 'utilities'; CategoryLabel = 'Mobile & Devices'; IconId = 'cat-mobile' }
    }
    if ($haystack -match '1st grade|learn|cert|exam|study|note|resume|wiki|maps|guide|training|bookmark') {
        return @{ Category = 'docs'; CategoryLabel = 'Learning & Docs'; IconId = 'cat-edu' }
    }

    return @{ Category = 'utilities'; CategoryLabel = 'Productivity & Tools'; IconId = 'cat-tools' }
}

function Find-BestProjectEntry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$FolderPath,
        [Parameter(Mandatory)][string]$FolderName,
        [hashtable]$KnownEntry
    )

    if ($KnownEntry -and $KnownEntry.Entry) {
        $candidateRel = $KnownEntry.Entry -replace '^\.\./', ''
        $candidateFull = Join-Path -Path $ProjectsDir -ChildPath ($candidateRel -replace '/', '\')
        if (Test-Path -LiteralPath $candidateFull) {
            return ($candidateRel -replace '\\', '/')
        }
    }

    $preferredRelPaths = @(
        'index.html',
        'public\index.html',
        'dashboard\index.html',
        'static\index.html',
        'wwwroot\index.html',
        'web\index.html',
        'studio\index.html',
        'ui\index.html',
        'simulator\index.html',
        'webpage\index.html',
        'app\index.html'
    )

    foreach ($rel in $preferredRelPaths) {
        $full = Join-Path -Path $FolderPath -ChildPath $rel
        if (Test-Path -LiteralPath $full -PathType Leaf) {
            return ("$FolderName/" + ($rel -replace '\\', '/'))
        }
    }

    $skipPattern = '\\(node_modules|\.venv|venv|\.git|dist|build|bin|obj|Library|Temp|Logs|Intermediate|DerivedDataCache|__pycache__|\.pytest_cache)\\'

    $htmlFiles = @(Get-ChildItem -Path $FolderPath -Recurse -Filter '*.html' -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch $skipPattern })

    if ($htmlFiles.Count -gt 0) {
        $bestHtml = $htmlFiles | Sort-Object {
            $relSub = $_.FullName.Substring($FolderPath.Length).TrimStart('\', '/')
            $depth = ($relSub -split '[\\/]').Count
            $isIndex = if ($_.Name -eq 'index.html') { 0 } else { 1 }
            "{0:D2}_{1:D2}_{2}" -f $depth, $isIndex, $relSub
        } | Select-Object -First 1

        $relSub = $bestHtml.FullName.Substring($FolderPath.Length).TrimStart('\', '/') -replace '\\', '/'
        return "$FolderName/$relSub"
    }

    $readmePath = Join-Path -Path $FolderPath -ChildPath 'README.md'
    if (Test-Path -LiteralPath $readmePath -PathType Leaf) {
        return "$FolderName/README.md"
    }

    $mdFiles = @(Get-ChildItem -Path $FolderPath -Depth 2 -Filter '*.md' -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch $skipPattern })
    if ($mdFiles.Count -gt 0) {
        $firstMd = $mdFiles | Select-Object -First 1
        $relSub = $firstMd.FullName.Substring($FolderPath.Length).TrimStart('\', '/') -replace '\\', '/'
        return "$FolderName/$relSub"
    }

    return $null
}

Write-SyncLog -Message 'Starting Choogle Browser 2.0 project registry synchronization...'

$KnownProjects = @{}
if (Test-Path -LiteralPath $MetadataPath) {
    $rawMeta = [System.IO.File]::ReadAllText($MetadataPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
    foreach ($prop in $rawMeta.PSObject.Properties) {
        $KnownProjects[$prop.Name.ToLowerInvariant()] = @{
            Name       = $prop.Value.Name
            Title      = $prop.Value.Title
            Entry      = $prop.Value.Entry
            SearchKeys = @($prop.Value.SearchKeys)
            Snippet    = $prop.Value.Snippet
        }
    }
}

$suiteApps = @(
    @{ id = 'choogle-home'; name = 'Choogle Home'; title = 'Choogle Search & Workspace Home'; iconId = 'app-choogle'; category = 'suite'; url = 'choogle://home'; description = 'Primary Choogle Browser new-tab search portal and quick-launch command surface.' },
    @{ id = 'choogle-hub'; name = 'App Hub'; title = 'Choogle Application Hub'; iconId = 'app-hub'; category = 'suite'; url = 'choogle://hub'; description = 'Unified launcher and discovery directory for all Antigravity projects.' },
    @{ id = 'choogle-icons'; name = 'Icon Studio'; title = 'Choogle Custom Icon Studio'; iconId = 'app-icons'; category = 'suite'; url = 'choogle://icons'; description = 'Browse, customize, recolor, and export the bespoke Choogle SVG and PNG icon pack.' },
    @{ id = 'choogle-chai'; name = 'chAI'; title = 'chAI Personal AI Assistant'; iconId = 'app-chai'; category = 'suite'; url = 'choogle://app/chai.html'; description = 'Multi-session conversational AI workspace built into Choogle.' },
    @{ id = 'choogle-tasks'; name = 'Tasks'; title = 'Choogle Kanban Tasks'; iconId = 'app-tasks'; category = 'suite'; url = 'choogle://app/tasks.html'; description = 'Local Kanban project board for tracking engineering work.' },
    @{ id = 'choogle-notepad'; name = 'Notepad'; title = 'Choogle Scratchpad & Notes'; iconId = 'app-notepad'; category = 'suite'; url = 'choogle://app/notepad.html'; description = 'Persistent browser notebook and quick technical scratchpad.' },
    @{ id = 'choogle-webstore'; name = 'Web Store'; title = 'Choogle Extensions & Modules'; iconId = 'app-webstore'; category = 'suite'; url = 'choogle://app/webstore.html'; description = 'Extensions, overlays, and enhancements directory for Choogle.' },
    @{ id = 'choogle-outages'; name = 'Outages'; title = 'Outages & Service Status Radar'; iconId = 'app-outages'; category = 'suite'; url = 'choogle://app/outages.html'; description = 'Live cloud and ISP telemetry radar.' },
    @{ id = 'choogle-hacked'; name = 'HackedOut'; title = 'HackedOut Threat Monitor'; iconId = 'app-hacked'; category = 'suite'; url = 'choogle://app/hacked.html'; description = 'Security breach intelligence and incident feed monitor.' },
    @{ id = 'choogle-rhcsa'; name = 'RHCSA Lab'; title = 'RHCSA Linux Practice Lab'; iconId = 'app-rhcsa'; category = 'labs'; url = 'choogle://app/rhcsa.html'; description = 'RHEL 9 administration drills and CLI readiness console.' },
    @{ id = 'choogle-vmware'; name = 'VMware Prep'; title = 'VMware Infrastructure Lab'; iconId = 'app-vmware'; category = 'labs'; url = 'choogle://app/vmware.html'; description = 'vSphere, HA/DRS, and virtualization study workbench.' },
    @{ id = 'choogle-ccna'; name = 'CCNA Lab'; title = 'CCNA Networking Workbench'; iconId = 'app-ccna'; category = 'labs'; url = 'choogle://app/ccna.html'; description = 'Subnetting, routing, and packet switching practice lab.' },
    @{ id = 'choogle-dlm'; name = 'DLM Storage'; title = 'Data Lifecycle Management Lab'; iconId = 'app-dlm'; category = 'labs'; url = 'choogle://app/dlm.html'; description = 'Enterprise storage tiering and retention simulator.' },
    @{ id = 'choogle-powershell'; name = 'PowerShell'; title = 'PowerShell Automation Lab'; iconId = 'app-powershell'; category = 'labs'; url = 'choogle://app/powershell.html'; description = 'Windows automation, cmdlet reference, and scripting studio.' }
)

$projectFolders = @(Get-ChildItem -Path $ProjectsDir -Directory |
    Where-Object { $_.Name -ne 'Choogle' -and $_.Name -notmatch '^\.' } |
    Sort-Object Name)

$projectsList = [System.Collections.Generic.List[object]]::new()
$seenSlugs = @{}

foreach ($folder in $projectFolders) {
    $folderName = $folder.Name
    $folderKey = $folderName.ToLowerInvariant()
    $known = if ($KnownProjects.ContainsKey($folderKey)) { $KnownProjects[$folderKey] } else { $null }

    $relFromProjects = Find-BestProjectEntry -FolderPath $folder.FullName -FolderName $folderName -KnownEntry $known
    if (-not $relFromProjects) {
        continue
    }

    $cleanDisplay = ($folderName -replace '[-_]', ' ').Trim()
    $displayName = if ($known -and $known.Name) { $known.Name } else { $cleanDisplay }
    $fullTitle = if ($known -and $known.Title) { $known.Title } else { $cleanDisplay }
    $snippet = if ($known -and $known.Snippet) {
        $known.Snippet
    } else {
        "Local Antigravity workspace project located at projects/$folderName."
    }

    $classification = Resolve-ProjectClassification -FolderName $folderName -Title $fullTitle -Snippet $snippet
    $slug = ConvertTo-ProjectSlug -Text $folderName
    if (-not $slug -or $seenSlugs.ContainsKey($slug)) {
        continue
    }
    $seenSlugs[$slug] = $true

    $searchKeys = @($cleanDisplay.ToLowerInvariant(), $folderName.ToLowerInvariant())
    if ($known -and $known.SearchKeys) {
        $searchKeys = @($known.SearchKeys + $searchKeys | Select-Object -Unique)
    } else {
        $searchKeys = @($searchKeys | Select-Object -Unique)
    }

    $hasHtml = $relFromProjects.ToLowerInvariant().EndsWith('.html')
    $choogleUrl = ConvertTo-ChoogleProjectsUrl -RelativeFromProjects $relFromProjects

    $projectsList.Add([PSCustomObject]@{
        id            = $slug
        folder        = $folderName
        name          = $displayName
        title         = $fullTitle
        category      = $classification.Category
        categoryLabel = $classification.CategoryLabel
        iconId        = $classification.IconId
        entry         = "../$relFromProjects"
        choogleUrl    = $choogleUrl
        hasHtml       = $hasHtml
        searchKeys    = $searchKeys
        snippet       = $snippet
    })
}

$registryPayload = [PSCustomObject]@{
    version     = '2.0.0'
    generatedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    count       = $projectsList.Count
    suiteApps   = $suiteApps
    projects    = $projectsList
}

$jsonOutput = $registryPayload | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText($RegistryPath, $jsonOutput, $Utf8NoBom)
Write-SyncLog -Message "Wrote $($projectsList.Count) deduplicated project entries to projects-registry.json."

# Cleanly sync missing search keys into search-data.js without injecting duplicate HTML
if (Test-Path -LiteralPath $SearchDataJsPath) {
    $searchJsContent = [System.IO.File]::ReadAllText($SearchDataJsPath, [System.Text.Encoding]::UTF8)
    $addedKeys = 0
    $snippetsToInsert = [System.Text.StringBuilder]::new()

    foreach ($proj in $projectsList) {
        $primaryKey = $proj.searchKeys[0]
        if (-not $primaryKey) { continue }
        $escapedKey = [regex]::Escape($primaryKey)
        if ($searchJsContent -notmatch "`"$escapedKey`"\s*:") {
            $safeTitle = ($proj.title -replace '\\', '\\' -replace '"', '\"')
            $safeEntry = ($proj.entry -replace '\\', '\\' -replace '"', '\"')
            $safeSnippet = ($proj.snippet -replace '\\', '\\' -replace '"', '\"')
            $safeKey = ($primaryKey -replace '\\', '\\' -replace '"', '\"')

            [void]$snippetsToInsert.AppendLine("    `"$safeKey`": [")
            [void]$snippetsToInsert.AppendLine("      {")
            [void]$snippetsToInsert.AppendLine("        title: `"$safeTitle`",")
            [void]$snippetsToInsert.AppendLine("        url: `"$safeEntry`",")
            [void]$snippetsToInsert.AppendLine("        displayedUrl: `"$safeEntry`",")
            [void]$snippetsToInsert.AppendLine("        snippet: `"$safeSnippet`"")
            [void]$snippetsToInsert.AppendLine("      }")
            [void]$snippetsToInsert.AppendLine("    ],")
            $addedKeys++
        }
    }

    if ($addedKeys -gt 0) {
        $block = $snippetsToInsert.ToString().TrimEnd("`r", "`n")
        if ($searchJsContent -match '(?m)^(\s*"applications":\s*\[)') {
            $searchJsContent = [regex]::Replace($searchJsContent, '(?m)^(\s*"applications":\s*\[)', "$block`r`n`$1", 1)
            [System.IO.File]::WriteAllText($SearchDataJsPath, $searchJsContent, $Utf8NoBom)
            Write-SyncLog -Message "Synced $addedKeys new search-data.js project keys."
        }
    }
}

Write-SyncLog -Message 'Choogle project synchronization complete.'
