cd frontend
npm run build
cd ..

cd backend
composer install --no-dev --optimize-autoloader
cd ..