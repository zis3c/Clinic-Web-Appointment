@echo off
echo Starting Clinic Web Appointment System with Peak Performance...

cd clinic-app

:: 1. Clear any old, stale caches
echo Clearing old caches...
if exist public\hot del public\hot
call php artisan optimize:clear

:: 2. Cache configuration, routes, events, and views for maximum speed
echo Caching config, routes, events, and views...
call php artisan config:cache
call php artisan route:cache
call php artisan event:cache
call php artisan view:cache

:: 3. Build frontend assets for production (minimized, bundled, and optimized)
echo Building frontend assets (this might take a moment)...
call npm run build

:: 4. Open the browser
echo Opening the application in your default browser...
start http://localhost:8000

:: 5. Start Laravel Reverb (WebSocket server) in its own window
echo Starting Reverb WebSocket server...
start "Laravel Reverb" cmd /c "php artisan reverb:start"

:: 6. Start Laravel Queue Worker in its own window
echo Starting Queue Worker...
start "Laravel Queue" cmd /c "php artisan queue:work"

:: 7. Start the Laravel backend server in the current window
echo Starting the backend server...
php artisan serve --host=127.0.0.1 --port=8000 --no-reload
