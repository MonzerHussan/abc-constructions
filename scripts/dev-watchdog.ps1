# Keeps the ABC dev server on port 3002 running — restarts if it stops or stops responding.
# Usage (from repo or C:\dev\tender-market):
#   npm run dev:stable
# Or:
#   powershell -ExecutionPolicy Bypass -File scripts/dev-watchdog.ps1

$ErrorActionPreference = "Continue"

$Port = if ($env:DEV_PORT) { [int]$env:DEV_PORT } else { 3002 }
$HealthUrl = "http://localhost:$Port/api/v1/health"
$CheckSeconds = if ($env:DEV_WATCHDOG_INTERVAL) { [int]$env:DEV_WATCHDOG_INTERVAL } else { 20 }
$LogDir = Join-Path $env:TEMP "abc-dev-watchdog"
$LogFile = Join-Path $LogDir "watchdog.log"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Write-Log([string]$Message) {
  $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
  Add-Content -Path $LogFile -Value $line
  Write-Host $line
}

function Get-ProjectRoot {
  if ($env:ABC_DEV_ROOT -and (Test-Path (Join-Path $env:ABC_DEV_ROOT "package.json"))) {
    return (Resolve-Path $env:ABC_DEV_ROOT).Path
  }
  if (Test-Path "C:\dev\tender-market\package.json") {
    return "C:\dev\tender-market"
  }
  return (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

function Stop-PortListener([int]$ListenPort) {
  Get-NetTCPConnection -LocalPort $ListenPort -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

function Test-DevHealthy {
  try {
    $res = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 8
    return $res.StatusCode -eq 200
  } catch {
    return $false
  }
}

$Root = Get-ProjectRoot
Write-Log "Watchdog started. Root=$Root Port=$Port Log=$LogFile"

Push-Location $Root
try {
  while ($true) {
    if (-not (Test-DevHealthy)) {
      Write-Log "Dev server down or unhealthy — restarting..."
      Stop-PortListener -ListenPort $Port
      Start-Sleep -Seconds 2

      $proc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c", "npm run dev:$Port" `
        -WorkingDirectory $Root `
        -WindowStyle Hidden `
        -PassThru

      Write-Log "Started npm run dev:$Port (pid $($proc.Id))"
      Start-Sleep -Seconds 12
    }

    Start-Sleep -Seconds $CheckSeconds
  }
}
finally {
  Pop-Location
}
