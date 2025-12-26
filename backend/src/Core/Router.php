<?php

namespace App\Core;

class Router
{
  private $routes;
  private $globalMiddleware = [];
  private $protectedMiddleware = [];

  public function __construct(array $config)
  {
    $this->globalMiddleware = $config['middleware'] ?? [];
    $this->protectedMiddleware = $config['protected']['middleware'] ?? [];
    $this->routes = [
      'public' => $config['routes'] ?? [],
      'protected' => $config['protected']['routes'] ?? [],
    ];
  }

  public function dispatch(Request $request): Response
  {
    $method = $request->getMethod();
    $path = $request->getPath();

    // Manejar preflight OPTIONS antes de aplicar middlewares
    // Esto asegura que CORS funcione incluso si no hay ruta definida
    if ($method === 'OPTIONS') {
      // Aplicar solo CORS middleware para OPTIONS
      $result = $this->applyMiddleware($request, $this->globalMiddleware);
      if ($result instanceof \App\Core\Response) {
        return $result;
      }
      // Si el middleware no devolvió respuesta, devolver respuesta CORS básica
      return Response::json([], 204)
        ->header('Access-Control-Allow-Origin', CORS_ORIGIN)
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, Accept')
        ->header('Access-Control-Allow-Credentials', 'true')
        ->header('Access-Control-Max-Age', '86400');
    }

    // Aplicar middleware global
    $result = $this->applyMiddleware($request, $this->globalMiddleware);
    if ($result instanceof \App\Core\Response) {
      return $result;
    }
    $request = $result;

    // Buscar ruta pública
    $route = $this->findRoute($method, $path, $this->routes['public']);
    
    if ($route) {
      return $this->executeRoute($request, $route);
    }

    // Buscar ruta protegida
    $route = $this->findRoute($method, $path, $this->routes['protected']);
    
    if ($route) {
      // Aplicar middleware protegido
      $result = $this->applyMiddleware($request, $this->protectedMiddleware);
      if ($result instanceof \App\Core\Response) {
        return $result;
      }
      $request = $result;
      
      // Aplicar middleware específico de la ruta
      if (isset($route[3])) {
        $result = $this->applyMiddleware($request, $route[3]);
        if ($result instanceof \App\Core\Response) {
          return $result;
        }
        $request = $result;
      }
      
      return $this->executeRoute($request, $route);
    }

    // 404 - con información de debug
    $debugInfo = [];
    if (defined('APP_DEBUG') && APP_DEBUG) {
      $debugInfo = [
        'requested_path' => $path,
        'requested_method' => $method,
        'available_public_routes' => array_map(function($r) { return $r[0] . ' ' . $r[1]; }, $this->routes['public']),
        'available_protected_routes' => array_map(function($r) { return $r[0] . ' ' . $r[1]; }, $this->routes['protected']),
      ];
    }
    
    return Response::json([
      'error' => [
        'code' => 'NOT_FOUND',
        'message' => 'Route not found',
        'details' => $debugInfo
      ]
    ], 404);
  }

  private function findRoute(string $method, string $path, array $routes): ?array
  {
    foreach ($routes as $route) {
      $routeMethod = $route[0];
      $routePath = $route[1];

      if ($routeMethod !== $method) {
        continue;
      }

      // Convertir ruta con parámetros a regex
      $pattern = $this->pathToRegex($routePath);
      
      if (preg_match($pattern, $path, $matches)) {
        // Extraer parámetros
        array_shift($matches);
        $route['params'] = $matches;
        return $route;
      }
    }

    return null;
  }

  private function pathToRegex(string $path): string
  {
    // Escapar caracteres especiales de regex excepto los que queremos usar
    $pattern = preg_quote($path, '#');
    // Reemplazar los parámetros {id} con grupos de captura
    $pattern = preg_replace('/\\\{(\w+)\\\}/', '([^/]+)', $pattern);
    return '#^' . $pattern . '$#';
  }

  private function executeRoute(Request $request, array $route): Response
  {
    $handler = $route[2];
    $params = $route['params'] ?? [];

    if (is_array($handler) && count($handler) === 2) {
      $controller = $handler[0];
      $method = $handler[1];
      
      if (class_exists($controller) && method_exists($controller, $method)) {
        $controllerInstance = new $controller();
        return $controllerInstance->$method($request, ...$params);
      }
    }

    return Response::json([
      'error' => [
        'code' => 'INVALID_HANDLER',
        'message' => 'Invalid route handler'
      ]
    ], 500);
  }

  private function applyMiddleware(Request $request, array $middlewares): Request|Response
  {
    foreach ($middlewares as $middleware) {
      try {
        if (is_array($middleware)) {
          // Middleware con configuración [MiddlewareClass => ['param1', 'param2']]
          foreach ($middleware as $middlewareClass => $config) {
            if (class_exists($middlewareClass)) {
              $middlewareInstance = new $middlewareClass($config);
              $result = $middlewareInstance->handle($request, function($req) {
                return $req;
              });
              if ($result instanceof \App\Core\Response) {
                return $result;
              }
              $request = $result;
            }
          }
        } elseif (class_exists($middleware)) {
          $middlewareInstance = new $middleware();
          $result = $middlewareInstance->handle($request, function($req) {
            return $req;
          });
          if ($result instanceof \App\Core\Response) {
            return $result;
          }
          $request = $result;
        }
      } catch (\Exception $e) {
        // Si un middleware falla, registrar el error pero continuar
        // Esto previene que errores en middlewares no críticos bloqueen toda la aplicación
        error_log('Middleware error (' . (is_string($middleware) ? $middleware : get_class($middleware)) . '): ' . $e->getMessage());
        if (APP_DEBUG) {
          error_log('Stack trace: ' . $e->getTraceAsString());
        }
        // Continuar con el siguiente middleware o la ruta
      }
    }
    return $request;
  }
}

