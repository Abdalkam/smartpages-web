param([string]$Message)

if (-not $Message) { $Message = "Release $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }

Write-Host "Building..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build FAILED - release aborted." -ForegroundColor Red
    exit 1
}

Write-Host "Committing..." -ForegroundColor Cyan
git add -A
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing new to commit." -ForegroundColor Yellow
}

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push
Write-Host "Done." -ForegroundColor Green
