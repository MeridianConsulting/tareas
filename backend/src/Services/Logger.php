<?php

namespace App\Services;

class Logger
{
  private static $logPath;
  private static $logLevel;

  public static function init(): void
  {
    self::$logPath = LOG_PATH;
    self::$logLevel = self::parseLogLevel(LOG_LEVEL);

    // Crear directorio de logs si no existe
    if (!is_dir(self::$logPath)) {
      mkdir(self::$logPath, 0755, true);
    }
  }

  private static function parseLogLevel(string $level): int
  {
    $levels = [
      'DEBUG' => 0,
      'INFO' => 1,
      'WARNING' => 2,
      'ERROR' => 3,
    ];
    return $levels[strtoupper($level)] ?? 1;
  }

  private static function shouldLog(int $level): bool
  {
    return $level >= self::$logLevel;
  }

  private static function write(string $level, string $message, array $context = []): void
  {
    if (!self::$logPath) {
      self::init();
    }

    $levelMap = [
      0 => 'DEBUG',
      1 => 'INFO',
      2 => 'WARNING',
      3 => 'ERROR',
    ];

    $levelName = $levelMap[$level] ?? 'INFO';

    if (!self::shouldLog($level)) {
      return;
    }

    $timestamp = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? ' ' . json_encode($context) : '';
    $logMessage = "[{$timestamp}] [{$levelName}] {$message}{$contextStr}\n";

    $logFile = self::$logPath . '/app-' . date('Y-m-d') . '.log';
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
  }

  public static function debug(string $message, array $context = []): void
  {
    self::write(0, $message, $context);
  }

  public static function info(string $message, array $context = []): void
  {
    self::write(1, $message, $context);
  }

  public static function warning(string $message, array $context = []): void
  {
    self::write(2, $message, $context);
  }

  public static function error(string $message, array $context = []): void
  {
    self::write(3, $message, $context);
  }

  /**
   * Log de acciones de seguridad (login, logout, cambios críticos)
   */
  public static function security(string $action, array $context = []): void
  {
    $message = "SECURITY: {$action}";
    self::write(1, $message, $context);
  }
}

