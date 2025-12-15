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
    $details = null;

    if (APP_DEBUG) {
      $message = $exception->getMessage();
      $details = [
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
        'trace' => explode("\n", $exception->getTraceAsString()),
      ];
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

    // Asegurar que los headers CORS estén establecidos antes de enviar la respuesta
    $origin = $_SERVER['HTTP_ORIGIN'] ?? CORS_ORIGIN;
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, Accept');
    header('Content-Type: application/json');

    $errorResponse = [
      'error' => [
        'code' => 'INTERNAL_ERROR',
        'message' => $message,
      ]
    ];
    
    if ($details) {
      $errorResponse['error']['details'] = $details;
    }

    http_response_code($statusCode);
    echo json_encode($errorResponse);
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

