<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

class CorsMiddleware
{
  public function handle(Request $request, callable $next)
  {
    // Obtener el origen de la petición
    $requestOrigin = $request->getHeader('Origin');
    
    // Determinar el origen permitido
    $origin = CORS_ORIGIN;
    
    // En desarrollo, permitir localhost con cualquier puerto o path
    if (defined('APP_ENV') && APP_ENV === 'local') {
      if ($requestOrigin && (
        strpos($requestOrigin, 'http://localhost') === 0 ||
        strpos($requestOrigin, 'http://127.0.0.1') === 0
      )) {
        $origin = $requestOrigin;
      }
    }
    
    $method = $request->getMethod();

    // Handle preflight OPTIONS request
    if ($method === 'OPTIONS') {
      $response = Response::json([], 204);
      $response
        ->header('Access-Control-Allow-Origin', $origin)
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, Accept')
        ->header('Access-Control-Allow-Credentials', 'true')
        ->header('Access-Control-Max-Age', '86400');
      return $response;
    }

    // Handle actual request
    $response = $next($request);

    if ($response instanceof Response) {
      $response
        ->header('Access-Control-Allow-Origin', $origin)
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, Accept')
        ->header('Access-Control-Allow-Credentials', 'true')
        ->header('X-Developed-By', 'Jose Mateo Lopez Cifuentes');
    }

    return $response;
  }
}

