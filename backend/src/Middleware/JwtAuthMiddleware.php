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
      
      // Obtener usuario
      $user = $this->userRepository->findById($payload['sub']);
      
      if (!$user || !$user['is_active']) {
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
        'role' => $user['role_name'],
        'area_id' => $user['area_id'],
        'email' => $user['email'],
        'name' => $user['name'],
      ]);

      return $next($request);
    } catch (\Exception $e) {
      return Response::json([
        'error' => [
          'code' => 'UNAUTHORIZED',
          'message' => 'Invalid or expired token'
        ]
      ], 401);
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

