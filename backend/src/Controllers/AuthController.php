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
    $userContext = $request->getAttribute('userContext');
    $user = $this->userRepository->findById($userContext['id']);

    if (!$user) {
      return Response::json([
        'error' => [
          'code' => 'NOT_FOUND',
          'message' => 'User not found'
        ]
      ], 404);
    }

    return Response::json([
      'data' => UserResource::toArray($user)
    ]);
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

