<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService
{
  private $secret;
  private $algorithm;

  public function __construct()
  {
    $this->secret = JWT_SECRET;
    $this->algorithm = JWT_ALG;
    
    // Asegurar que siempre haya un secreto válido
    if (empty($this->secret) || trim($this->secret) === '') {
      // Solo usar secreto por defecto si está completamente vacío
      if (APP_ENV === 'local' || APP_DEBUG) {
        $this->secret = 'dev_secret_key_change_in_production_12345';
        error_log('JWT_SECRET is empty, using default dev secret');
      } else {
        throw new \Exception('JWT_SECRET is not configured. Please set it in .env file.');
      }
    }
    
    // Log para debugging (solo en modo debug)
    if (APP_DEBUG) {
      error_log('JwtService initialized with secret length: ' . strlen($this->secret));
    }
  }

  public function generateAccessToken(int $userId, string $role, ?int $areaId = null): string
  {
    $now = time();
    $exp = $now + (JWT_ACCESS_TTL_MIN * 60);

    $payload = [
      'sub' => $userId,
      'role' => $role,
      'area_id' => $areaId,
      'iat' => $now,
      'exp' => $exp,
      'type' => 'access',
    ];

    return JWT::encode($payload, $this->secret, $this->algorithm);
  }

  public function generateRefreshToken(int $userId): string
  {
    $now = time();
    $exp = $now + (JWT_REFRESH_TTL_DAYS * 24 * 60 * 60);

    $payload = [
      'sub' => $userId,
      'iat' => $now,
      'exp' => $exp,
      'type' => 'refresh',
    ];

    return JWT::encode($payload, $this->secret, $this->algorithm);
  }

  public function validate(string $token): array
  {
    try {
      $decoded = JWT::decode($token, new Key($this->secret, $this->algorithm));
      return (array) $decoded;
    } catch (\Exception $e) {
      throw new \Exception('Invalid token: ' . $e->getMessage());
    }
  }

  public function hashToken(string $token): string
  {
    return hash('sha256', $token);
  }
}

