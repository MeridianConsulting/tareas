<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Repositories\RefreshTokenRepository;

class AuthService
{
  private $userRepository;
  private $jwtService;
  private $refreshTokenRepository;

  public function __construct()
  {
    $this->userRepository = new UserRepository();
    $this->jwtService = new JwtService();
    $this->refreshTokenRepository = new RefreshTokenRepository();
  }

  public function login(string $email, string $password, string $ip, string $userAgent): array
  {
    $user = $this->userRepository->findByEmail($email);

    if (!$user || !password_verify($password, $user['password_hash'])) {
      throw new \Exception('Invalid credentials');
    }

    if (!$user['is_active']) {
      throw new \Exception('User account is inactive');
    }

    // Generar tokens
    $accessToken = $this->jwtService->generateAccessToken(
      $user['id'],
      $user['role_name'],
      $user['area_id']
    );

    $refreshToken = $this->jwtService->generateRefreshToken($user['id']);
    $tokenHash = $this->jwtService->hashToken($refreshToken);

    // Guardar refresh token
    $expiresAt = date('Y-m-d H:i:s', time() + (JWT_REFRESH_TTL_DAYS * 24 * 60 * 60));
    $this->refreshTokenRepository->create([
      'user_id' => $user['id'],
      'token_hash' => $tokenHash,
      'expires_at' => $expiresAt,
      'ip' => $ip,
      'user_agent' => $userAgent,
    ]);

    return [
      'access_token' => $accessToken,
      'refresh_token' => $refreshToken,
      'user' => $user,
    ];
  }

  public function refresh(string $refreshToken, string $ip, string $userAgent): array
  {
    $tokenHash = $this->jwtService->hashToken($refreshToken);
    $storedToken = $this->refreshTokenRepository->findByTokenHash($tokenHash);

    if (!$storedToken) {
      throw new \Exception('Invalid refresh token');
    }

    // Validar JWT
    $payload = $this->jwtService->validate($refreshToken);

    if ($payload['type'] !== 'refresh') {
      throw new \Exception('Invalid token type');
    }

    // Obtener usuario
    $user = $this->userRepository->findById($payload['sub']);

    if (!$user || !$user['is_active']) {
      throw new \Exception('User account is inactive');
    }

    // Revocar token anterior
    $this->refreshTokenRepository->revokeToken($tokenHash);

    // Generar nuevos tokens
    $newAccessToken = $this->jwtService->generateAccessToken(
      $user['id'],
      $user['role_name'],
      $user['area_id']
    );

    $newRefreshToken = $this->jwtService->generateRefreshToken($user['id']);
    $newTokenHash = $this->jwtService->hashToken($newRefreshToken);

    // Guardar nuevo refresh token
    $expiresAt = date('Y-m-d H:i:s', time() + (JWT_REFRESH_TTL_DAYS * 24 * 60 * 60));
    $this->refreshTokenRepository->create([
      'user_id' => $user['id'],
      'token_hash' => $newTokenHash,
      'expires_at' => $expiresAt,
      'ip' => $ip,
      'user_agent' => $userAgent,
    ]);

    return [
      'access_token' => $newAccessToken,
      'refresh_token' => $newRefreshToken,
    ];
  }

  public function logout(string $refreshToken): void
  {
    $tokenHash = $this->jwtService->hashToken($refreshToken);
    $this->refreshTokenRepository->revokeToken($tokenHash);
  }

  public function logoutAll(int $userId): void
  {
    $this->refreshTokenRepository->revokeAllUserTokens($userId);
  }
}

