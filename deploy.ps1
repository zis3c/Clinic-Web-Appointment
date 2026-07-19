param(
    [string]$VpsHost = $env:VPS_HOST,
    [string]$VpsUser = $env:VPS_USER
)

if ([string]::IsNullOrWhiteSpace($VpsHost)) {
    $VpsHost = Read-Host "Enter VPS host"
}

if ([string]::IsNullOrWhiteSpace($VpsUser)) {
    $VpsUser = Read-Host "Enter VPS user"
}

Write-Host "1. Packaging deployment files (ignoring heavy vendor folders)..." -ForegroundColor Cyan
tar -czf deploy.tar.gz --exclude="node_modules" --exclude="vendor" --exclude=".git" --exclude="public/hot" --exclude=".env" -C clinic-app .

Write-Host "2. Uploading packaged files to VPS..." -ForegroundColor Cyan
scp deploy.tar.gz ${VpsUser}@${VpsHost}:/opt/clinic-app/

Write-Host "3. Unpacking and restarting Docker services on the live server..." -ForegroundColor Cyan
$remoteCommands = @"
cd /opt/clinic-app && tar -xzf deploy.tar.gz && rm deploy.tar.gz

cd /opt/clinic-app
docker-compose build app
docker-compose down
docker-compose up -d
cd /opt/livekit
docker-compose restart
"@

ssh ${VpsUser}@${VpsHost} $remoteCommands

Write-Host "4. Cleaning up temporary local files..." -ForegroundColor Cyan
Remove-Item deploy.tar.gz

Write-Host ""
Write-Host "Deployment completed successfully. The live server is now up-to-date." -ForegroundColor Green
