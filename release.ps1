param([string]$Message)

if (-not $Message) { $Message = "Release $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }

# 1. Build both apps (abort if the build breaks)
Write-Host "Building..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build FAILED - release aborted." -ForegroundColor Red
    exit 1
}

# 2. Commit local changes
Write-Host "Committing..." -ForegroundColor Cyan
git add -A
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing new to commit." -ForegroundColor Yellow
}

# 3. Sync with GitHub first (auto-update from any remote changes)
Write-Host "Syncing with GitHub..." -ForegroundColor Cyan
git pull --rebase
if ($LASTEXITCODE -ne 0) {
    Write-Host "Pull FAILED - resolve conflicts, then run 'git push' manually." -ForegroundColor Red
    exit 1
}

# 4. Push (this triggers Vercel auto-deploy automatically)
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push FAILED." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Done! Vercel is deploying now (~1 min)." -ForegroundColor Green
Write-Host "Live site : https://smartpages-web.vercel.app" -ForegroundColor Green
Write-Host "Status    : vercel ls" -ForegroundColor Gray