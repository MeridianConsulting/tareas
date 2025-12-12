<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

class CorsMiddleware
{
  public function handle(Request $request, callable $next)
  {
    $origin = CORS_ORIGIN;

    // Handle preflight
    if ($request->getMethod() === 'OPTIONS') {
      return Response::json([], 204)
        ->header('Access-Control-Allow-Origin', $origin)
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
        ->header('Access-Control-Allow-Credentials', 'true')
        ->header('Access-Control-Max-Age', '86400');
    }

    $response = $next($request);

    if ($response instanceof Response) {
      $response
        ->header('Access-Control-Allow-Origin', $origin)
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
        ->header('Access-Control-Allow-Credentials', 'true');
    }

    return $response;
  }
}

