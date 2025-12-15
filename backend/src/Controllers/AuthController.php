<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AuthService;
use App\Repositories\UserRepository;
use App\Resources\UserResource;

class AuthController
{
  private $authService;
  private $userRepository;

  public function __construct()
  {
    $this->authService = new AuthService();
    $this->userRepository = new UserRepository();
  }

  public function login(Request $request)
  {
    $email = $request->getBody('email');
    $password = $request->getBody('password');

    if (!$email || !$password) {
      return Response::json([
        'error' => [
          'code' => 'VALIDATION_ERROR',
          'message' => 'Email and password are required'
        ]
      ], 400);
    }

    try {
      $result = $this->authService->login(
        $email,
        $password,
        $request->getIp(),
        $request->getUserAgent()
      );

      // Establecer refresh token en cookie HttpOnly
      setcookie(
        'refresh_token',
        $result['refresh_token'],
        [
          'expires' => time() + (JWT_REFRESH_TTL_DAYS * 24 * 60 * 60),
          'path' => '/',
          'httponly' => true,
          'secure' => false, // Cambiar a true en producción con HTTPS
          'samesite' => 'Lax',
        ]
      );

      return Response::json([
        'data' => [
          'access_token' => $result['access_token'],
          'user' => UserResource::toArray($result['user']),
        ]
      ]);
    } catch (\Exception $e) {
      return Response::json([
        'error' => [
          'code' => 'AUTH_ERROR',
          'message' => $e->getMessage()
        ]
      ], 401);
    }
  }

  public function refresh(Request $request)
  {
    $refreshToken = $request->getCookie('refresh_token');

    if (!$refreshToken) {
      return Response::json([
        'error' => [
          'code' => 'UNAUTHORIZED',
          'message' => 'No refresh token provided'
        ]
      ], 401);
    }

    try {
      $result = $this->authService->refresh(
        $refreshToken,
        $request->getIp(),
        $request->getUserAgent()
      );

      // Establecer nuevo refresh token en cookie
      setcookie(
        'refresh_token',
        $result['refresh_token'],
        [
          'expires' => time() + (JWT_REFRESH_TTL_DAYS * 24 * 60 * 60),
          'path' => '/',
          'httponly' => true,
          'secure' => false,
          'samesite' => 'Lax',
        ]
      );

      return Response::json([
        'data' => [
          'access_token' => $result['access_token'],
        ]
      ]);
    } catch (\Exception $e) {
      return Response::json([
        'error' => [
          'code' => 'AUTH_ERROR',
          'message' => $e->getMessage()
        ]
      ], 401);
    }
  }

  public function me(Request $request)
  {
    try {
      $userContext = $request->getAttribute('userContext');
      
      if (!$userContext || !isset($userContext['id'])) {
        error_log('AuthController::me - User context not found');
        return Response::json([
          'error' => [
            'code' => 'UNAUTHORIZED',
            'message' => 'User context not found'
          ]
        ], 401);
      }

      $userId = $userContext['id'];
      error_log('AuthController::me - Looking for user ID: ' . $userId);
      
      $user = $this->userRepository->findById($userId);

      if (!$user) {
        error_log('AuthController::me - User not found with ID: ' . $userId);
        return Response::json([
          'error' => [
            'code' => 'NOT_FOUND',
            'message' => 'User not found'
          ]
        ], 404);
      }

      error_log('AuthController::me - User found: ' . $user['email']);
      
      $userData = UserResource::toArray($user);
      
      return Response::json([
        'data' => $userData
      ]);
    } catch (\Exception $e) {
      // Log del error para debugging
      error_log('AuthController::me error: ' . $e->getMessage());
      error_log('Stack trace: ' . $e->getTraceAsString());
      
      return Response::json([
        'error' => [
          'code' => 'INTERNAL_ERROR',
          'message' => APP_DEBUG ? $e->getMessage() : 'Internal server error',
          'details' => APP_DEBUG ? [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => explode("\n", $e->getTraceAsString()),
          ] : null
        ]
      ], 500);
    }
  }

  public function logout(Request $request)
  {
    $refreshToken = $request->getCookie('refresh_token');

    if ($refreshToken) {
      try {
        $this->authService->logout($refreshToken);
      } catch (\Exception $e) {
        // Continuar aunque falle
      }
    }

    // Eliminar cookie
    setcookie('refresh_token', '', [
      'expires' => time() - 3600,
      'path' => '/',
      'httponly' => true,
      'secure' => false,
      'samesite' => 'Lax',
    ]);

    return Response::json([
      'data' => ['message' => 'Logged out successfully']
    ]);
  }
}

