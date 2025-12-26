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
    $this->loginAttemptRepository = new LoginAttemptRepository();
    $this->maxAttempts = $maxAttempts ?? RATE_LIMIT_LOGIN_ATTEMPTS;
    $this->windowMinutes = $windowMinutes ?? RATE_LIMIT_LOGIN_WINDOW;
  }

  public function handle(Request $request, callable $next)
  {
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

    return $next($request);
  }
}

