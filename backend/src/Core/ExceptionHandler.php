<?php

namespace App\Core;

class ExceptionHandler
{
  public static function register(): void
  {
    set_exception_handler([self::class, 'handleException']);
    set_error_handler([self::class, 'handleError']);
  }

  public static function handleException(\Throwable $exception): void
  {
    $statusCode = 500;
    $message = 'Internal server error';

    if (APP_DEBUG) {
      $message = $exception->getMessage();
      $trace = $exception->getTraceAsString();
    }

    // Log error
    error_log(sprintf(
      "[%s] %s: %s in %s:%d\n%s",
      date('Y-m-d H:i:s'),
      get_class($exception),
      $exception->getMessage(),
      $exception->getFile(),
      $exception->getLine(),
      $exception->getTraceAsString()
    ));

    $response = Response::json([
      'error' => [
        'code' => 'INTERNAL_ERROR',
        'message' => $message,
      ]
    ], $statusCode);

    $response->send();
    exit;
  }

  public static function handleError(int $severity, string $message, string $file, int $line): bool
  {
    if (!(error_reporting() & $severity)) {
      return false;
    }

    throw new \ErrorException($message, 0, $severity, $file, $line);
  }
}

