<#
.SYNOPSIS
    Launches Choogle Browser 2.0 using the local NTFS Electron runtime.
.DESCRIPTION
    Ensures Electron is installed in %LOCALAPPDATA%\ChoogleBrowser\runtime
    (keeping heavy binaries out of Google Drive), then launches Choogle Browser.
    Supports -SmokeTest for automated headless/self-check verification.
#>

[CmdletBinding()]
param(
    [switch]$SmokeTest,
    [switch]$Wait,
    [switch]$InstallShortcut
)

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ScriptDir) { $ScriptDir = $PSScriptRoot }
Set-Location -Path $ScriptDir

$RuntimeDir = Join-Path -Path $env:LOCALAPPDATA -ChildPath 'ChoogleBrowser\runtime'
$ElectronExe = Join-Path -Path $RuntimeDir -ChildPath 'node_modules\electron\dist\electron.exe'

function Initialize-ElectronRuntime {
    [CmdletBinding()]
    param()

    if (Test-Path -LiteralPath $ElectronExe) {
        return
    }

    Write-Output "Setting up Electron runtime in $RuntimeDir ..."
    New-Item -ItemType Directory -Force -Path $RuntimeDir | Out-Null
    $pkgPath = Join-Path -Path $RuntimeDir -ChildPath 'package.json'
    if (-not (Test-Path -LiteralPath $pkgPath)) {
        '{"name":"choogle-electron-runtime","version":"1.0.0","private":true}' | Set-Content -Path $pkgPath -Encoding UTF8
    }

    Push-Location -Path $RuntimeDir
    try {
        & npm install electron --no-audit --no-fund
        if (-not (Test-Path -LiteralPath $ElectronExe)) {
            $installScript = Join-Path -Path $RuntimeDir -ChildPath 'node_modules\electron\install.js'
            if (Test-Path -LiteralPath $installScript) {
                & node $installScript
            }
        }
    }
    finally {
        Pop-Location
    }

    if (-not (Test-Path -LiteralPath $ElectronExe)) {
        throw [System.IO.FileNotFoundException]::new("Electron runtime binary could not be initialized at $ElectronExe")
    }
}

Initialize-ElectronRuntime

if ($InstallShortcut) {
    $shortcutScript = Join-Path -Path $ScriptDir -ChildPath 'Install-ChoogleShortcut.ps1'
    & $shortcutScript
}

if ($SmokeTest) {
    $proc = Start-Process -FilePath $ElectronExe -ArgumentList @("`"$ScriptDir`"", '--smoke-test') -WorkingDirectory $ScriptDir -Wait -PassThru
    exit $proc.ExitCode
}

if ($Wait) {
    $proc = Start-Process -FilePath $ElectronExe -ArgumentList "`"$ScriptDir`"" -WorkingDirectory $ScriptDir -WindowStyle Normal -Wait -PassThru
    exit $proc.ExitCode
}

Start-Process -FilePath $ElectronExe -ArgumentList "`"$ScriptDir`"" -WorkingDirectory $ScriptDir -WindowStyle Normal | Out-Null
Write-Output 'Choogle Browser 2.0 launched.'
