<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AuthService;
use App\Services\Logger;
use App\Repositories\UserRepository;
use App\Repositories\LoginAttemptRepository;
use App\Resources\UserResource;

class AuthController
{
  private $authService;
  private $userRepository;
  private $loginAttemptRepository;

  public function __construct()
  {
    $this->authService = new AuthService();
    $this->userRepository = new UserRepository();
    $this->loginAttemptRepository = new LoginAttemptRepository();
  }

  public function login(Request $request)
  {
    $email = $request->getBody('email');
    $password = $request->getBody('password');
    $ip = $request->getIp();
    $userAgent = $request->getUserAgent();

    // Validación básica
    if (!$email || !$password) {
      return Response::json([
        'error' => [
          'code' => 'VALIDATION_ERROR',
          'message' => 'Email and password are required'
        ]
      ], 400);
    }

    // Validar formato de email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      return Response::json([
        'error' => [
          'code' => 'VALIDATION_ERROR',
          'message' => 'Invalid email format'
        ]
      ], 400);
    }

    try {
      $result = $this->authService->login(
        $email,
        $password,
        $ip,
        $userAgent
      );

      // Registrar intento exitoso
      try {
        $this->loginAttemptRepository->recordAttempt($ip, $email, true, $userAgent);
      } catch (\Exception $e) {
        // Si falla el registro, continuar de todas formas
        error_log('Failed to record login attempt: ' . $e->getMessage());
      }
      
      // Log de seguridad
      try {
        Logger::security('Login successful', [
          'user_id' => $result['user']['id'],
          'email' => $email,
          'ip' => $ip
        ]);
      } catch (\Exception $e) {
        // Si falla el log, continuar de todas formas
        error_log('Failed to log security event: ' . $e->getMessage());
      }

      // Determinar si usar secure flag basado en el entorno
      $isSecure = (APP_ENV === 'production' || (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'));

      // Establecer refresh token en cookie HttpOnly
      setcookie(
        'refresh_token',
        $result['refresh_token'],
        [
          'expires' => time() + (JWT_REFRESH_TTL_DAYS * 24 * 60 * 60),
          'path' => '/',
          'httponly' => true,
          'secure' => $isSecure,
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
      // Registrar intento fallido
      try {
        $this->loginAttemptRepository->recordAttempt($ip, $email, false, $userAgent);
      } catch (\Exception $recordError) {
        // Si falla el registro, continuar de todas formas
        error_log('Failed to record failed login attempt: ' . $recordError->getMessage());
      }
      
      // Log de seguridad
      try {
        Logger::security('Login failed', [
          'email' => $email,
          'ip' => $ip,
          'reason' => $e->getMessage()
        ]);
      } catch (\Exception $logError) {
        // Si falla el log, continuar de todas formas
        error_log('Failed to log security event: ' . $logError->getMessage());
      }

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

      // Determinar si usar secure flag basado en el entorno
      $isSecure = (APP_ENV === 'production' || (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'));

      // Establecer nuevo refresh token en cookie
      setcookie(
        'refresh_token',
        $result['refresh_token'],
        [
          'expires' => time() + (JWT_REFRESH_TTL_DAYS * 24 * 60 * 60),
          'path' => '/',
          'httponly' => true,
          'secure' => $isSecure,
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
      $user = $this->userRepository->findById($userId);

      if (!$user) {
        return Response::json([
          'error' => [
            'code' => 'NOT_FOUND',
            'message' => 'User not found'
          ]
        ], 404);
      }

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

    // Determinar si usar secure flag basado en el entorno
    $isSecure = (APP_ENV === 'production' || (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'));

    // Eliminar cookie
    setcookie('refresh_token', '', [
      'expires' => time() - 3600,
      'path' => '/',
      'httponly' => true,
      'secure' => $isSecure,
      'samesite' => 'Lax',
    ]);

    return Response::json([
      'data' => ['message' => 'Logged out successfully']
    ]);
  }

  /**
   * Health check endpoint para monitoreo
   */
  public function health(Request $request)
  {
    try {
      $db = \App\Core\Database::getInstance()->getConnection();
      $db->query('SELECT 1');
      $dbStatus = 'ok';
    } catch (\Exception $e) {
      $dbStatus = 'error';
    }

    $response = Response::json([
      'status' => 'ok',
      'timestamp' => date('Y-m-d H:i:s'),
      'environment' => APP_ENV,
      'database' => $dbStatus,
      'version' => '1.0.0'
    ]);
    
    // Header discreto con créditos del desarrollador
    $response->header('X-Developed-By', 'Jose Mateo Lopez Cifuentes');
    
    return $response;
  }
}

