<?php

// Habilitar reporte de errores para capturar todos los errores
error_reporting(E_ALL);
ini_set('display_errors', '0'); // No mostrar errores en pantalla, solo en logs
ini_set('log_errors', '1');

// Función para establecer headers CORS
function setCorsHeaders() {
    // Intentar obtener CORS_ORIGIN de la configuración si ya está cargada
    $allowedOrigin = defined('CORS_ORIGIN') ? CORS_ORIGIN : null;
    
    // Si no está definido, usar el origin de la petición o localhost por defecto
    $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? null;
    
    // Lista de orígenes permitidos (desarrollo)
    $devOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
    
    // Determinar el origen a usar
    if ($allowedOrigin) {
        // En producción, usar el CORS_ORIGIN configurado
        $origin = $allowedOrigin;
    } elseif ($requestOrigin && in_array($requestOrigin, $devOrigins)) {
        // En desarrollo, permitir localhost si coincide
        $origin = $requestOrigin;
    } else {
        // Por defecto, usar el origin de la petición si está disponible
        $origin = $requestOrigin;
    }
    
    if ($origin) {
        header("Access-Control-Allow-Origin: $origin");
    }
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, Accept');
}

// Función para manejar errores fatales
function handleFatalError() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
        setCorsHeaders();
        http_response_code(500);
        header('Content-Type: application/json');
        
        $showDebug = defined('APP_DEBUG') && APP_DEBUG;
        
        $message = 'Internal server error';
        $details = null;
        
        if ($showDebug) {
            $message = $error['message'] ?? 'Fatal error occurred';
            $details = [
                'file' => $error['file'] ?? 'unknown',
                'line' => $error['line'] ?? 0,
                'type' => $error['type'] ?? 0
            ];
        }
        
        // Log del error
        error_log(sprintf(
            "[%s] FATAL ERROR: %s in %s:%d",
            date('Y-m-d H:i:s'),
            $message,
            $error['file'] ?? 'unknown',
            $error['line'] ?? 0
        ));
        
        echo json_encode([
            'error' => [
                'code' => 'INTERNAL_ERROR',
                'message' => $message,
                'details' => $details
            ]
        ]);
        exit;
    }
}

// Registrar manejador de errores fatales
register_shutdown_function('handleFatalError');

// Headers CORS ANTES de cualquier salida (incluyendo errores)
setCorsHeaders();

// Manejar preflight OPTIONS directamente primero
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Max-Age: 86400');
    http_response_code(204);
    exit;
}

// Cargar autoloader primero
try {
    $autoloadPath = __DIR__ . '/../vendor/autoload.php';
    if (!file_exists($autoloadPath)) {
        throw new \Exception('Composer autoloader not found. Please run: composer install');
    }
    require_once $autoloadPath;
} catch (\Throwable $e) {
    setCorsHeaders();
    http_response_code(500);
    header('Content-Type: application/json');
    error_log('Failed to load autoloader: ' . $e->getMessage());
    echo json_encode([
        'error' => [
            'code' => 'INTERNAL_ERROR',
            'message' => 'Failed to initialize application'
        ]
    ]);
    exit;
}

use App\Core\Request;
use App\Core\Router;
use App\Core\ExceptionHandler;

try {
    // Cargar configuración
    $configPath = __DIR__ . '/../src/Config/config.php';
    if (!file_exists($configPath)) {
        throw new \Exception('Configuration file not found');
    }
    require $configPath;

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
    
    // Log del error
    error_log(sprintf(
        "[%s] %s: %s in %s:%d\n%s",
        date('Y-m-d H:i:s'),
        get_class($e),
        $e->getMessage(),
        $e->getFile(),
        $e->getLine(),
        $e->getTraceAsString()
    ));
    
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

