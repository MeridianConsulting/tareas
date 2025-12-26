<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class LoginAttemptRepository
{
  private PDO $db;

  public function __construct()
  {
    $this->db = Database::getInstance()->getConnection();
  }

  /**
   * Contar intentos de login fallidos por IP en la ventana de tiempo
   */
  public function countFailedAttempts(string $ip, int $windowMinutes): int
  {
    $stmt = $this->db->prepare("
      SELECT COUNT(*) 
      FROM login_attempts
      WHERE ip_address = ? 
        AND success = 0 
        AND attempted_at >= (NOW() - INTERVAL ? MINUTE)
    ");
    $stmt->execute([$ip, $windowMinutes]);
    return (int)$stmt->fetchColumn();
  }

  /**
   * Registrar un intento de login
   */
  public function recordAttempt(string $ip, string $email, bool $success, ?string $userAgent = null): void
  {
    $stmt = $this->db->prepare("
      INSERT INTO login_attempts (ip_address, email, success, user_agent, attempted_at)
      VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$ip, $email, $success ? 1 : 0, $userAgent]);
  }

  /**
   * Limpiar intentos antiguos (más de 24 horas)
   */
  public function cleanupOldAttempts(): void
  {
    $stmt = $this->db->prepare("
      DELETE FROM login_attempts
      WHERE attempted_at < (NOW() - INTERVAL 24 HOUR)
    ");
    $stmt->execute();
  }
}

