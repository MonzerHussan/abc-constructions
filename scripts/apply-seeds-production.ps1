# Load production DB credentials and run prisma migrate + survey seeds.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/apply-seeds-production.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$src = Join-Path $root ".env.production.local"
if (-not (Test-Path $src)) {
  Write-Error "Missing .env.production.local. Run: vercel env pull .env.production.local --environment=production --yes"
}

function Set-EnvFromLine([string]$line) {
  $idx = $line.IndexOf("=")
  if ($idx -lt 1) { return }
  $name = $line.Substring(0, $idx).Trim()
  $value = $line.Substring($idx + 1).Trim()
  if ($value.StartsWith('"') -and $value.EndsWith('"')) {
    $value = $value.Substring(1, $value.Length - 2)
  }
  if ($value.StartsWith("prisma+")) {
    $value = $value.Substring(7)
  }
  if ($value.StartsWith("postgres://")) {
    $value = "postgresql://" + $value.Substring(11)
  }
  Set-Item -Path "env:$name" -Value $value
}

Get-Content $src | Where-Object { $_ -match '^(DATABASE_URL|DIRECT_URL)=' } | ForEach-Object {
  Set-EnvFromLine $_
}

# Migrations need direct connection when pooler URL is present.
if ($env:DIRECT_URL) {
  $env:DATABASE_URL = $env:DIRECT_URL
}

Write-Host "Running prisma migrate deploy..."
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Applying survey seeds..."
npx tsx scripts/apply-survey-seed.ts --all
exit $LASTEXITCODE
