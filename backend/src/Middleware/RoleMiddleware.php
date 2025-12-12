<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

class RoleMiddleware
{
  private $allowedRoles;

  public function __construct(array $allowedRoles = [])
  {
    $this->allowedRoles = $allowedRoles;
  }

  public function handle(Request $request, callable $next)
  {
    $userContext = $request->getAttribute('userContext');

    if (!$userContext) {
      return Response::json([
        'error' => [
          'code' => 'UNAUTHORIZED',
          'message' => 'User context not found'
        ]
      ], 401);
    }

    $userRole = $userContext['role'] ?? null;

    if (!in_array($userRole, $this->allowedRoles)) {
      return Response::json([
        'error' => [
          'code' => 'FORBIDDEN',
          'message' => 'Insufficient permissions'
        ]
      ], 403);
    }

    return $next($request);
  }
}

