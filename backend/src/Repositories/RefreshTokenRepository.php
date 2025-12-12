<?php

namespace App\Repositories;

use App\Core\Database;

class RefreshTokenRepository
{
  private $db;

  public function __construct()
  {
    $this->db = Database::getInstance()->getConnection();
  }

  public function create(array $data): int
  {
    $sql = "
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip, user_agent)
      VALUES (:user_id, :token_hash, :expires_at, :ip, :user_agent)
    ";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([
      ':user_id' => $data['user_id'],
      ':token_hash' => $data['token_hash'],
      ':expires_at' => $data['expires_at'],
      ':ip' => $data['ip'] ?? null,
      ':user_agent' => $data['user_agent'] ?? null,
    ]);

    return (int) $this->db->lastInsertId();
  }

  public function findByTokenHash(string $tokenHash): ?array
  {
    $stmt = $this->db->prepare("
      SELECT * FROM refresh_tokens
      WHERE token_hash = :token_hash
      AND revoked_at IS NULL
      AND expires_at > NOW()
    ");
    $stmt->execute([':token_hash' => $tokenHash]);
    $token = $stmt->fetch();

    return $token ?: null;
  }

  public function revokeToken(string $tokenHash): bool
  {
    $stmt = $this->db->prepare("
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE token_hash = :token_hash
    ");
    return $stmt->execute([':token_hash' => $tokenHash]);
  }

  public function revokeAllUserTokens(int $userId): bool
  {
    $stmt = $this->db->prepare("
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = :user_id
      AND revoked_at IS NULL
    ");
    return $stmt->execute([':user_id' => $userId]);
  }

  public function cleanupExpiredTokens(): int
  {
    $stmt = $this->db->prepare("
      DELETE FROM refresh_tokens
      WHERE expires_at < NOW()
    ");
    $stmt->execute();
    return $stmt->rowCount();
  }
}

