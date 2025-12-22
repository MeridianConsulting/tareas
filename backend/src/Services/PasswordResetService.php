<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Repositories\PasswordResetRepository;

class PasswordResetService
{
  private $db;
  private $users;
  private $resets;
  private $mail;

  public function __construct()
  {
    $this->db = \App\Core\Database::getInstance()->getConnection();
    $this->users = new UserRepository();
    $this->resets = new PasswordResetRepository();
    $this->mail = new MailService();
  }

  private function hashOtp(string $otp): string
  {
    return hash_hmac('sha256', $otp, APP_KEY);
  }

  private function hashToken(string $token): string
  {
    return hash('sha256', $token);
  }

  private function generateOtp(): string
  {
    return str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
  }

  private function generateResetToken(): string
  {
    $raw = random_bytes(32);
    return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
  }

  public function requestOtp(string $email, ?string $ip, ?string $ua): void
  {
    $user = $this->users->findByEmail($email);

    // SI NO EXISTE, NO REVELAR NADA (retornar silencioso)
    if (!$user) {
      return;
    }

    // Rate limit simple por usuario: 3 cada 15 minutos
    $count = $this->resets->countRecentOtpRequests((int)$user['id'], 15);
    if ($count >= OTP_REQUEST_LIMIT_15MIN) {
      return; // responderá 200 igual desde el controller
    }

    // Invalidar OTPs anteriores activos para que sea 1 solo OTP vigente
    $this->resets->invalidateActiveOtps((int)$user['id']);

    $otp = $this->generateOtp();
    $otpHash = $this->hashOtp($otp);
    $otpExpires = date('Y-m-d H:i:s', time() + (OTP_TTL_MINUTES * 60));

    $this->resets->createOtp((int)$user['id'], $otpHash, $otpExpires, $ip, $ua);

    // Enviar correo
    $name = $user['name'] ?? 'Usuario';
    $this->mail->sendPasswordResetOtp($user['email'], $name, $otp);
  }

  public function verifyOtp(string $email, string $otp): string
  {
    $user = $this->users->findByEmail($email);
    if (!$user) {
      throw new \Exception('Código inválido o expirado');
    }

    $row = $this->resets->getLatestActiveOtp((int)$user['id']);
    if (!$row) {
      throw new \Exception('Código inválido o expirado');
    }

    // Expiración
    if (strtotime($row['expires_at']) < time()) {
      $this->resets->markOtpUsed((int)$row['id']);
      throw new \Exception('Código inválido o expirado');
    }

    // Intentos
    if ((int)$row['attempts'] >= OTP_MAX_ATTEMPTS) {
      $this->resets->markOtpUsed((int)$row['id']);
      throw new \Exception('Código inválido o expirado');
    }

    $incomingHash = $this->hashOtp($otp);
    $valid = hash_equals($row['otp_hash'], $incomingHash);

    if (!$valid) {
      $this->resets->incrementOtpAttempts((int)$row['id']);
      throw new \Exception('Código inválido o expirado');
    }

    // OTP correcto → marcar usado y emitir reset_token
    $this->resets->markOtpUsed((int)$row['id']);

    $resetToken = $this->generateResetToken();
    $tokenHash = $this->hashToken($resetToken);
    $tokenExpires = date('Y-m-d H:i:s', time() + (RESET_TOKEN_TTL_MINUTES * 60));

    $this->resets->createResetToken((int)$user['id'], $tokenHash, $tokenExpires);

    return $resetToken;
  }

  public function resetPassword(string $resetToken, string $newPassword): void
  {
    $tokenHash = $this->hashToken($resetToken);
    $row = $this->resets->findActiveResetToken($tokenHash);

    if (!$row) {
      throw new \Exception('Token inválido o expirado');
    }

    $userId = (int)$row['user_id'];

    // Hash seguro (Argon2id si está disponible)
    $algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
    $passwordHash = password_hash($newPassword, $algo);

    $this->users->updatePasswordHash($userId, $passwordHash);

    $this->resets->markResetTokenUsed((int)$row['id']);

    // Recomendado: invalidar refresh tokens/sesiones del usuario
    // Esto se puede implementar después si tienes una tabla de sesiones
    // $this->users->revokeAllRefreshTokens($userId);
  }
}

