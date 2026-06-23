# Build and start the full AFS Docker stack on Windows.
# Usage (from repo root):
#   .\scripts\docker-build.ps1
#   .\scripts\docker-build.ps1 -Up        # build then docker compose up
#   .\scripts\docker-build.ps1 -NoCache   # force clean rebuild

param(
    [switch]$Up,
    [switch]$NoCache
)

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$env:DOCKER_BUILDKIT = "1"
$env:COMPOSE_DOCKER_CLI_BUILD = "1"

Write-Host "Building AFS images (BuildKit enabled)..." -ForegroundColor Cyan

$buildArgs = @("compose", "build")
if ($NoCache) { $buildArgs += "--no-cache" }

& docker @buildArgs
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Build failed. Common fixes on Windows:" -ForegroundColor Yellow
    Write-Host "  1. Docker Desktop -> Settings -> Resources -> ensure enough memory (4GB+)"
    Write-Host "  2. Docker Desktop -> Settings -> Network -> DNS: 8.8.8.8"
    Write-Host "  3. Disable VPN temporarily, then retry"
    Write-Host "  4. docker pull python:3.11-slim-bookworm"
    Write-Host "  5. .\scripts\docker-build.ps1 -NoCache"
    exit $LASTEXITCODE
}

Write-Host "Build succeeded." -ForegroundColor Green

if ($Up) {
    Write-Host "Starting stack..." -ForegroundColor Cyan
    $composeArgs = @("compose", "up")
    if (Test-Path ".env.docker") {
        $composeArgs += @("--env-file", ".env.docker")
    }
    & docker @composeArgs
}
