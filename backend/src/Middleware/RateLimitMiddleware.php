<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Repositories\LoginAttemptRepository;

class RateLimitMiddleware
{
  private $loginAttemptRepository;
  private $maxAttempts;
  private $windowMinutes;

  public function __construct(int $maxAttempts = null, int $windowMinutes = null)
  {
    try {
      $this->loginAttemptRepository = new LoginAttemptRepository();
    } catch (\Exception $e) {
      // Si falla la inicialización del repositorio, guardar null
      // El handle() verificará esto y permitirá que continúe
      $this->loginAttemptRepository = null;
      error_log('RateLimitMiddleware: Failed to initialize LoginAttemptRepository: ' . $e->getMessage());
    }
    $this->maxAttempts = $maxAttempts ?? (defined('RATE_LIMIT_LOGIN_ATTEMPTS') ? RATE_LIMIT_LOGIN_ATTEMPTS : 5);
    $this->windowMinutes = $windowMinutes ?? (defined('RATE_LIMIT_LOGIN_WINDOW') ? RATE_LIMIT_LOGIN_WINDOW : 15);
  }

  public function handle(Request $request, callable $next)
  {
    // Si el repositorio no se pudo inicializar, permitir que continúe sin rate limiting
    if ($this->loginAttemptRepository === null) {
      return $next($request);
    }

    try {
      $ip = $request->getIp();
      $failedAttempts = $this->loginAttemptRepository->countFailedAttempts($ip, $this->windowMinutes);

      if ($failedAttempts >= $this->maxAttempts) {
        return Response::json([
          'error' => [
            'code' => 'RATE_LIMIT_EXCEEDED',
            'message' => 'Too many login attempts. Please try again later.',
            'retry_after_minutes' => $this->windowMinutes
          ]
        ], 429);
      }
    } catch (\Exception $e) {
      // Si hay un error al verificar rate limiting (BD no disponible, tabla no existe, etc.)
      // Permitir que el login continúe (fail-open) pero registrar el error
      error_log('RateLimitMiddleware error: ' . $e->getMessage());
      if (APP_DEBUG) {
        error_log('Stack trace: ' . $e->getTraceAsString());
      }
      // Continuar con el request sin bloquear
    }

    return $next($request);
  }
}

