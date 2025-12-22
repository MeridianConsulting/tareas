<?php

// Función para establecer headers CORS
function setCorsHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:3000';
    $allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, Accept');
}

// Headers CORS ANTES de cualquier salida (incluyendo errores)
setCorsHeaders();

// Manejar preflight OPTIONS directamente primero
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Max-Age: 86400');
    http_response_code(204);
    exit;
}

// Cargar autoloader primero
require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\Request;
use App\Core\Router;
use App\Core\ExceptionHandler;

try {
    // Cargar configuración
    require __DIR__ . '/../src/Config/config.php';

    // Establecer headers CORS nuevamente después de cargar config (por si cambió)
    if (defined('CORS_ORIGIN')) {
        header("Access-Control-Allow-Origin: " . CORS_ORIGIN);
    }

    // Registrar manejador de excepciones
    ExceptionHandler::register();

    // Crear request y router
    $request = Request::fromGlobals();
    $routes = require __DIR__ . '/../src/Config/routes.php';
    $router = new Router($routes);

    // Dispatch
    $response = $router->dispatch($request);
    $response->send();
} catch (\Throwable $e) {
    // En caso de error, asegurar que los headers CORS estén establecidos
    setCorsHeaders();
    http_response_code(500);
    header('Content-Type: application/json');
    
    $showDebug = defined('APP_DEBUG') && APP_DEBUG;
    
    echo json_encode([
        'error' => [
            'code' => 'INTERNAL_ERROR',
            'message' => $showDebug ? $e->getMessage() : 'Internal server error',
            'details' => $showDebug ? [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString())
            ] : null
        ]
    ]);
}

