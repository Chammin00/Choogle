<#
.SYNOPSIS
    Creates Desktop and Start Menu shortcuts for Choogle Browser 2.0 with custom .ico.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ScriptDir) { $ScriptDir = $PSScriptRoot }
Set-Location -Path $ScriptDir

$IconPath = Join-Path -Path $ScriptDir -ChildPath 'assets\icons\choogle.ico'
if (-not (Test-Path -LiteralPath $IconPath)) {
    $buildScript = Join-Path -Path $ScriptDir -ChildPath 'scripts\build-icons.py'
    if (Test-Path -LiteralPath $buildScript) {
        & python $buildScript
    }
}

$RuntimeDir = Join-Path -Path $env:LOCALAPPDATA -ChildPath 'ChoogleBrowser\runtime'
$ElectronExe = Join-Path -Path $RuntimeDir -ChildPath 'node_modules\electron\dist\electron.exe'

if (-not (Test-Path -LiteralPath $ElectronExe)) {
    throw [System.IO.FileNotFoundException]::new("Electron runtime not found at $ElectronExe. Run Launch-Choogle.ps1 first.")
}

$DesktopDir = [Environment]::GetFolderPath('Desktop')
$StartMenuDir = Join-Path -Path $env:APPDATA -ChildPath 'Microsoft\Windows\Start Menu\Programs'

$targets = @(
    (Join-Path -Path $DesktopDir -ChildPath 'Choogle Browser.lnk'),
    (Join-Path -Path $StartMenuDir -ChildPath 'Choogle Browser.lnk')
)

$wsh = New-Object -ComObject WScript.Shell
foreach ($lnkPath in $targets) {
    $parentDir = Split-Path -Path $lnkPath -Parent
    if (-not (Test-Path -LiteralPath $parentDir)) {
        New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
    }
    $shortcut = $wsh.CreateShortcut($lnkPath)
    $shortcut.TargetPath = $ElectronExe
    $shortcut.Arguments = "`"$ScriptDir`""
    $shortcut.WorkingDirectory = $ScriptDir
    $shortcut.IconLocation = "$IconPath,0"
    $shortcut.Description = 'Choogle Browser 2.0'
    $shortcut.Save()
    Write-Output "Created shortcut: $lnkPath"
}
