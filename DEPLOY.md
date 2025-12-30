#Frontend

cd frontend
npm run build
$frontendFiles = @('out')
if (Test-Path '.env.local') {
    $frontendFiles += '.env.local'
}
Compress-Archive -Path $frontendFiles -DestinationPath ..\frontend_production.zip -Force
cd ..


#Backend

cd backend
composer install --no-dev --optimize-autoloader
$files = @('src', 'public', 'vendor', 'storage', 'composer.json', 'composer.lock')
if (Test-Path '.env') {
    $files += '.env'
}
if (Test-Path '.htaccess') {
    $files += '.htaccess'
}
Compress-Archive -Path $files -DestinationPath ..\backend_production.zip -Force
cd ..