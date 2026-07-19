@echo off
echo Starting Clinic Web Appointment System in DEVELOPMENT MODE...

cd clinic-app

:: 1. Clear any old caches (Don't cache anything in Dev mode!)
echo Clearing caches so changes apply immediately...
call php artisan optimize:clear

:: 1.5 Re-discover packages sequentially to prevent race conditions on Windows
echo Rebuilding package cache...
call php artisan package:discover

:: 2. Open the browser
echo Opening the application in your default browser...
start http://127.0.0.1:8000

:: 3. Start all services concurrently (Server, Vite, Queue, Reverb)
echo Starting services...
call composer run dev

pause
