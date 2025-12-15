<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Services\JwtService;
use App\Repositories\UserRepository;

class JwtAuthMiddleware
{
  private $jwtService;
  private $userRepository;

  public function __construct()
  {
    $this->jwtService = new JwtService();
    $this->userRepository = new UserRepository();
  }

  public function handle(Request $request, callable $next)
  {
    $token = $this->extractToken($request);

    if (!$token) {
      return Response::json([
        'error' => [
          'code' => 'UNAUTHORIZED',
          'message' => 'No token provided'
        ]
      ], 401);
    }

    try {
      $payload = $this->jwtService->validate($token);
      
      if (!isset($payload['sub'])) {
        return Response::json([
          'error' => [
            'code' => 'UNAUTHORIZED',
            'message' => 'Invalid token payload'
          ]
        ], 401);
      }
      
      // Obtener usuario
      $user = $this->userRepository->findById($payload['sub']);
      
      if (!$user) {
        error_log('User not found with ID: ' . $payload['sub']);
        return Response::json([
          'error' => [
            'code' => 'UNAUTHORIZED',
            'message' => 'User not found'
          ]
        ], 401);
      }
      
      if (!$user['is_active']) {
        return Response::json([
          'error' => [
            'code' => 'UNAUTHORIZED',
            'message' => 'User account is inactive'
          ]
        ], 403);
      }

      // Adjuntar contexto de usuario al request
      $request->setAttribute('userContext', [
        'id' => $user['id'],
        'role' => $user['role_name'] ?? null,
        'area_id' => $user['area_id'] ?? null,
        'email' => $user['email'],
        'name' => $user['name'],
      ]);

      return $next($request);
    } catch (\Exception $e) {
      // Log del error para debugging
      error_log('JwtAuthMiddleware error: ' . $e->getMessage());
      error_log('Stack trace: ' . $e->getTraceAsString());
      
      // En caso de error, devolver 500 si es un error interno, 401 si es de autenticación
      $isAuthError = strpos($e->getMessage(), 'token') !== false || 
                     strpos($e->getMessage(), 'Invalid') !== false ||
                     strpos($e->getMessage(), 'expired') !== false;
      
      $statusCode = $isAuthError ? 401 : 500;
      $message = APP_DEBUG ? $e->getMessage() : ($isAuthError ? 'Invalid or expired token' : 'Internal server error');
      
      return Response::json([
        'error' => [
          'code' => $isAuthError ? 'UNAUTHORIZED' : 'INTERNAL_ERROR',
          'message' => $message,
          'details' => APP_DEBUG ? [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => explode("\n", $e->getTraceAsString()),
          ] : null
        ]
      ], $statusCode);
    }
  }

  private function extractToken(Request $request): ?string
  {
    $authHeader = $request->getHeader('Authorization');
    
    if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
      return $matches[1];
    }

    return null;
  }
}

