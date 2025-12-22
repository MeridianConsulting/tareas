<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\PasswordResetService;

class PasswordResetController
{
  private $service;

  public function __construct()
  {
    $this->service = new PasswordResetService();
  }

  public function forgot(Request $request)
  {
    $email = trim((string)$request->getBody('email'));

    // Siempre responder 200 para evitar enumeración
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
      try {
        $this->service->requestOtp($email, $request->getIp(), $request->getUserAgent());
      } catch (\Exception $e) {
        // No revelar detalles, pero loguear
        error_log("PasswordReset forgot error: " . $e->getMessage());
      }
    }

    return Response::json([
      'data' => [
        'message' => 'Si el correo existe, enviaremos un código de verificación.'
      ]
    ], 200);
  }

  public function verifyOtp(Request $request)
  {
    $email = trim((string)$request->getBody('email'));
    $otp = trim((string)$request->getBody('otp'));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^\d{6}$/', $otp)) {
      return Response::json([
        'error' => [
          'code' => 'VALIDATION_ERROR',
          'message' => 'Datos inválidos'
        ]
      ], 422);
    }

    try {
      $resetToken = $this->service->verifyOtp($email, $otp);
      return Response::json([
        'data' => [
          'reset_token' => $resetToken
        ]
      ], 200);
    } catch (\Exception $e) {
      return Response::json([
        'error' => [
          'code' => 'OTP_INVALID',
          'message' => 'Código inválido o expirado'
        ]
      ], 400);
    }
  }

  public function reset(Request $request)
  {
    $resetToken = trim((string)$request->getBody('reset_token'));
    $password = (string)$request->getBody('password');
    $confirm = (string)$request->getBody('confirm_password');

    if (!$resetToken || strlen($resetToken) < 20) {
      return Response::json([
        'error' => ['code' => 'VALIDATION_ERROR', 'message' => 'Token inválido']
      ], 422);
    }

    if ($password !== $confirm) {
      return Response::json([
        'error' => ['code' => 'VALIDATION_ERROR', 'message' => 'Las contraseñas no coinciden']
      ], 422);
    }

    // Política mínima (ajústala)
    $strong = strlen($password) >= 10
      && preg_match('/[A-Z]/', $password)
      && preg_match('/[a-z]/', $password)
      && preg_match('/\d/', $password)
      && preg_match('/[^A-Za-z0-9]/', $password);

    if (!$strong) {
      return Response::json([
        'error' => [
          'code' => 'WEAK_PASSWORD',
          'message' => 'La contraseña debe tener mínimo 10 caracteres e incluir mayúscula, minúscula, número y símbolo.'
        ]
      ], 422);
    }

    try {
      $this->service->resetPassword($resetToken, $password);

      return Response::json([
        'data' => [
          'message' => 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.'
        ]
      ], 200);
    } catch (\Exception $e) {
      return Response::json([
        'error' => [
          'code' => 'RESET_FAILED',
          'message' => 'Token inválido o expirado'
        ]
      ], 400);
    }
  }
}

