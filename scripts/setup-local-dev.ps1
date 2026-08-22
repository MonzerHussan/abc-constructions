# Copy ABC tender-market from OneDrive to a local fast path (C:\dev).
# Run from repo root:  npm run setup:local
# Or:  powershell -ExecutionPolicy Bypass -File scripts/setup-local-dev.ps1

$ErrorActionPreference = "Stop"

$Source = if ($env:SETUP_LOCAL_SOURCE) { $env:SETUP_LOCAL_SOURCE } else { (Resolve-Path (Join-Path $PSScriptRoot "..")).Path }
$Dest = if ($env:SETUP_LOCAL_DEST) { $env:SETUP_LOCAL_DEST } else { "C:\dev\tender-market" }

Write-Host "=== ABC local dev setup ===" -ForegroundColor Cyan
Write-Host "Source: $Source"
Write-Host "Dest:   $Dest"
Write-Host ""

New-Item -ItemType Directory -Force -Path (Split-Path $Dest -Parent) | Out-Null

$excludeDirs = @("node_modules", ".next", ".turbo", "coverage", "test-results", "playwright-report")
$xd = ($excludeDirs | ForEach-Object { "/XD"; $_ })

Write-Host "Copying project (excluding heavy build folders)..." -ForegroundColor Yellow
& robocopy $Source $Dest /E /COPY:DAT /R:2 /W:2 @xd /NFL /NDL /NJH /NJS /nc /ns /np
# robocopy exit codes 0-7 = success
if ($LASTEXITCODE -gt 7) {
  throw "robocopy failed with exit code $LASTEXITCODE"
}

if (Test-Path (Join-Path $Source ".env")) {
  Copy-Item (Join-Path $Source ".env") (Join-Path $Dest ".env") -Force
  Write-Host "Copied .env" -ForegroundColor Green
}
if (Test-Path (Join-Path $Source ".env.local")) {
  Copy-Item (Join-Path $Source ".env.local") (Join-Path $Dest ".env.local") -Force
  Write-Host "Copied .env.local" -ForegroundColor Green
}

Push-Location $Dest
try {
  Write-Host "Installing dependencies..." -ForegroundColor Yellow
  npm install

  Write-Host "Generating Prisma client..." -ForegroundColor Yellow
  npx prisma generate

  $envPath = Join-Path $Dest ".env"
  if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    $vars = @(
      "DATABASE_CONNECT_TIMEOUT_MS=15000",
      "DATABASE_POOL_MAX=5",
      "DATABASE_IDLE_TIMEOUT_MS=30000"
    )
    foreach ($line in $vars) {
      $key = ($line -split "=")[0]
      if ($envContent -notmatch "(?m)^$key=") {
        Add-Content -Path $envPath -Value $line
        Write-Host "Added $key to .env" -ForegroundColor Green
      }
    }
  }
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "Done. Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open folder in Cursor:  $Dest"
Write-Host "  2. Stop any old dev server on port 3002"
Write-Host "  3. Run (auto-restart):  cd `"$Dest`" ; npm run dev:stable"
Write-Host "     Or once:            cd `"$Dest`" ; npm run dev:3002"
Write-Host "  4. Admin:  http://localhost:3002/projects/ABC/admin"
Write-Host ""
Write-Host "Optional: keep OneDrive copy but exclude heavy folders:" -ForegroundColor DarkGray
Write-Host "  powershell -ExecutionPolicy Bypass -File scripts/exclude-onedrive-cache.ps1"
