<?php

require_once __DIR__ . '/../../vendor/autoload.php';

use Dotenv\Dotenv;

// Cargar variables de entorno
$dotenv = Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

// Configuración de la aplicación
define('APP_ENV', $_ENV['APP_ENV'] ?? 'local');
define('APP_DEBUG', filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN));

// Configuración de base de datos
define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'tareas');
define('DB_USER', $_ENV['DB_USER'] ?? 'root');
define('DB_PASS', $_ENV['DB_PASS'] ?? '');

// Configuración JWT
define('JWT_ALG', $_ENV['JWT_ALG'] ?? 'HS256');
define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? '');
define('JWT_ACCESS_TTL_MIN', (int)($_ENV['JWT_ACCESS_TTL_MIN'] ?? 15));
define('JWT_REFRESH_TTL_DAYS', (int)($_ENV['JWT_REFRESH_TTL_DAYS'] ?? 14));

// CORS
define('CORS_ORIGIN', $_ENV['CORS_ORIGIN'] ?? 'http://localhost:3000');

// Timezone
date_default_timezone_set('America/Bogota');

