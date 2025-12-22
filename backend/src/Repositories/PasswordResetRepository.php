<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class PasswordResetRepository
{
  private PDO $db;

  public function __construct()
  {
    $this->db = Database::getInstance()->getConnection();
  }

  public function countRecentOtpRequests(int $userId, int $minutes): int
  {
    $stmt = $this->db->prepare("
      SELECT COUNT(*) 
      FROM password_reset_otps
      WHERE user_id = ? AND created_at >= (NOW() - INTERVAL ? MINUTE)
    ");
    $stmt->execute([$userId, $minutes]);
    return (int)$stmt->fetchColumn();
  }

  public function invalidateActiveOtps(int $userId): void
  {
    $stmt = $this->db->prepare("
      UPDATE password_reset_otps
      SET used_at = NOW()
      WHERE user_id = ? AND used_at IS NULL AND expires_at > NOW()
    ");
    $stmt->execute([$userId]);
  }

  public function createOtp(int $userId, string $otpHash, string $expiresAt, ?string $ip, ?string $ua): void
  {
    $stmt = $this->db->prepare("
      INSERT INTO password_reset_otps (user_id, otp_hash, expires_at, used_at, attempts, created_ip, user_agent)
      VALUES (?, ?, ?, NULL, 0, ?, ?)
    ");
    $stmt->execute([$userId, $otpHash, $expiresAt, $ip, $ua]);
  }

  public function getLatestActiveOtp(int $userId): ?array
  {
    $stmt = $this->db->prepare("
      SELECT * FROM password_reset_otps
      WHERE user_id = ? AND used_at IS NULL
      ORDER BY id DESC
      LIMIT 1
    ");
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  public function incrementOtpAttempts(int $otpId): void
  {
    $stmt = $this->db->prepare("
      UPDATE password_reset_otps
      SET attempts = attempts + 1
      WHERE id = ?
    ");
    $stmt->execute([$otpId]);
  }

  public function markOtpUsed(int $otpId): void
  {
    $stmt = $this->db->prepare("
      UPDATE password_reset_otps
      SET used_at = NOW()
      WHERE id = ?
    ");
    $stmt->execute([$otpId]);
  }

  public function createResetToken(int $userId, string $tokenHash, string $expiresAt): void
  {
    $stmt = $this->db->prepare("
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used_at)
      VALUES (?, ?, ?, NULL)
    ");
    $stmt->execute([$userId, $tokenHash, $expiresAt]);
  }

  public function findActiveResetToken(string $tokenHash): ?array
  {
    $stmt = $this->db->prepare("
      SELECT * FROM password_reset_tokens
      WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
      LIMIT 1
    ");
    $stmt->execute([$tokenHash]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  public function markResetTokenUsed(int $id): void
  {
    $stmt = $this->db->prepare("
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE id = ?
    ");
    $stmt->execute([$id]);
  }
}

