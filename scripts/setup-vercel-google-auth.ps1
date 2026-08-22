# Sync Google OAuth + auth URL env vars to Vercel (Production + Preview).
# Reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET from .env in repo root.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/setup-vercel-google-auth.ps1

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envFile = Join-Path $root ".env"
$prodUrl = "https://abc-constructions-gray.vercel.app"

if (-not (Test-Path $envFile)) {
  Write-Error ".env not found at $envFile"
}

function Get-EnvValue([string]$name) {
  $line = Select-String -Path $envFile -Pattern "^$name=" | Select-Object -First 1
  if (-not $line) { return $null }
  $raw = $line.Line.Substring($name.Length + 1).Trim()
  if ($raw.StartsWith('"') -and $raw.EndsWith('"')) {
    return $raw.Substring(1, $raw.Length - 2)
  }
  return $raw.Trim().Trim('"')
}

function Set-VercelEnv([string]$name, [string]$value, [string[]]$environments) {
  $value = $value.Trim()
  if ([string]::IsNullOrWhiteSpace($value)) {
    Write-Warning "Skipping $name - empty value in .env"
    return
  }
  foreach ($env in $environments) {
    cmd /c "vercel env rm $name $env --yes >nul 2>&1"
    $tempFile = New-TemporaryFile
    try {
      [System.IO.File]::WriteAllText($tempFile.FullName, $value)
      Get-Content -Raw $tempFile.FullName | vercel env add $name $env --force
    } finally {
      Remove-Item $tempFile.FullName -Force -ErrorAction SilentlyContinue
    }
    if ($LASTEXITCODE -ne 0) {
      Write-Error "Failed to set $name for $env"
    }
    Write-Host "Set $name ($env)"
  }
}

$googleId = Get-EnvValue "AUTH_GOOGLE_ID"
$googleSecret = Get-EnvValue "AUTH_GOOGLE_SECRET"
$targets = @("production", "preview")

Set-VercelEnv "AUTH_GOOGLE_ID" $googleId $targets
Set-VercelEnv "AUTH_GOOGLE_SECRET" $googleSecret $targets
Set-VercelEnv "NEXTAUTH_URL" $prodUrl $targets
Set-VercelEnv "AUTH_URL" $prodUrl $targets

Write-Host ""
Write-Host "Done. Redeploy required: vercel --prod"
Write-Host ("Google Console redirect URI: {0}/api/auth/callback/google" -f $prodUrl)
