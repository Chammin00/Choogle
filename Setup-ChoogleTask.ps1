<#
.SYNOPSIS
    Registers or updates the Windows Scheduled Task for the 00:05 AM Choogle Project Sync.
.DESCRIPTION
    Creates a scheduled task named 'Antigravity-Choogle-Sync-0005' that triggers every night at 00:05 (12:05 AM).
    Runs Sync-ChoogleProjects.ps1 silently in the background and updates Choogle apps and search data.
#>

[CmdletBinding()]
param()

$TaskName = "Antigravity-Choogle-Sync-0005"
$ChoogleDir = $PSScriptRoot
$ScriptPath = Join-Path -Path $ChoogleDir -ChildPath "Sync-ChoogleProjects.ps1"

Write-Host "Configuring Windows Scheduled Task: $TaskName" -ForegroundColor Cyan
Write-Host "Target script: $ScriptPath" -ForegroundColor Gray

# Trigger: Daily at 00:05 (12:05 AM)
$Trigger = New-ScheduledTaskTrigger -Daily -At 12:05AM

# Action: Launch PowerShell hidden with the Sync-ChoogleProjects.ps1 script
$PowerShellExe = (Get-Command powershell.exe).Source
$Arguments = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ScriptPath`""
$Action = New-ScheduledTaskAction -Execute $PowerShellExe -Argument $Arguments -WorkingDirectory $ChoogleDir

# Settings: Allow on battery, start when available if missed
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false

# Principal: Run as current user
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive

try {
    # Check if existing task exists and unregister
    $existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Updating existing scheduled task..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }

    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $Action `
        -Trigger $Trigger `
        -Settings $Settings `
        -Principal $Principal `
        -Description "Daily 00:05 AM automated sync of new Antigravity projects into Choogle apps menu and search index." | Out-Null

    Write-Host "[SUCCESS] Windows Scheduled Task '$TaskName' registered successfully!" -ForegroundColor Green
    $info = Get-ScheduledTaskInfo -TaskName $TaskName
    Write-Host "Next run scheduled for: $( $info.NextRunTime )" -ForegroundColor White
} catch {
    Write-Warning "Could not register via ScheduledTask cmdlets directly: $($_.Exception.Message)"
    Write-Host "Attempting fallback via schtasks.exe..." -ForegroundColor Gray

    $trCommand = "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ScriptPath`""
    & schtasks.exe /Create /TN $TaskName /TR $trCommand /SC DAILY /ST 00:05 /F
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Task created successfully via schtasks.exe." -ForegroundColor Green
    } else {
        Write-Error "Failed to register scheduled task."
    }
}
