# If the repo must stay under OneDrive, redirect heavy folders to C:\dev cache via junctions.
# Run from repo root AFTER closing dev server and deleting local node_modules/.next if present.

$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$CacheRoot = "C:\dev\.cache\tender-market"

Write-Host "Repo:  $RepoRoot" -ForegroundColor Cyan
Write-Host "Cache: $CacheRoot" -ForegroundColor Cyan

if ($RepoRoot -notlike "*OneDrive*") {
  Write-Host "Project is not under OneDrive — junction redirect not needed." -ForegroundColor Green
  exit 0
}

New-Item -ItemType Directory -Force -Path $CacheRoot | Out-Null

function Set-Junction {
  param([string]$Name, [string]$TargetSubdir)
  $link = Join-Path $RepoRoot $Name
  $target = Join-Path $CacheRoot $TargetSubdir
  New-Item -ItemType Directory -Force -Path $target | Out-Null

  if (Test-Path $link) {
    $item = Get-Item $link -Force
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
      Write-Host "$Name already a junction — skipping" -ForegroundColor DarkGray
      return
    }
    Write-Host "Removing existing $Name ..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $link
  }

  cmd /c mklink /J "$link" "$target" | Out-Null
  Write-Host "Linked $Name -> $target" -ForegroundColor Green
}

Set-Junction -Name "node_modules" -TargetSubdir "node_modules"
Set-Junction -Name ".next" -TargetSubdir "next-cache"

Write-Host ""
Write-Host "Heavy folders now live outside OneDrive sync path." -ForegroundColor Green
Write-Host "Run npm install once if node_modules is empty."
