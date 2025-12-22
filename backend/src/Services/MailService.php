<?php

namespace App\Services;

class MailService
{
  public function sendPasswordResetOtp(string $toEmail, string $toName, string $otp): void
  {
    // Intentar usar SMTP si está configurado y PHPMailer está disponible
    $smtpHost = $_ENV['SMTP_HOST'] ?? null;
    
    if ($smtpHost && class_exists('PHPMailer\PHPMailer\PHPMailer')) {
      $this->sendViaSmtp($toEmail, $toName, $otp);
    } else {
      // Fallback a mail() nativo para desarrollo local
      $this->sendViaNativeMail($toEmail, $toName, $otp);
    }
  }

  private function sendViaSmtp(string $toEmail, string $toName, string $otp): void
  {
    try {
      $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

      // Configuración SMTP
      $mail->isSMTP();
      $mail->Host = $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com';
      $mail->SMTPAuth = true;
      $mail->Username = $_ENV['SMTP_USER'] ?? '';
      $mail->Password = $_ENV['SMTP_PASS'] ?? '';
      $mail->Port = (int)($_ENV['SMTP_PORT'] ?? 587);
      $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
      $mail->CharSet = 'UTF-8';

      // Remitente
      $fromEmail = $_ENV['MAIL_FROM'] ?? 'no-reply@tu-dominio.com';
      $fromName = $_ENV['MAIL_FROM_NAME'] ?? 'Meridian Control';
      $mail->setFrom($fromEmail, $fromName);
      $mail->addAddress($toEmail, $toName);

      // Contenido
      $mail->isHTML(true);
      $mail->Subject = 'Código para restablecer tu contraseña';

      $ttl = OTP_TTL_MINUTES;

      $mail->Body = $this->getEmailTemplate($otp, $ttl);
      $mail->AltBody = "Tu código para restablecer contraseña es: {$otp}. Expira en {$ttl} minutos.";

      $mail->send();
    } catch (\PHPMailer\PHPMailer\Exception $e) {
      error_log("MailService SMTP error: " . $mail->ErrorInfo);
      // Fallback a mail() nativo si SMTP falla
      $this->sendViaNativeMail($toEmail, $toName, $otp);
    } catch (\Exception $e) {
      error_log("MailService error: " . $e->getMessage());
      // Fallback a mail() nativo si hay cualquier error
      $this->sendViaNativeMail($toEmail, $toName, $otp);
    }
  }

  private function sendViaNativeMail(string $toEmail, string $toName, string $otp): void
  {
    $ttl = OTP_TTL_MINUTES;
    $subject = 'Código para restablecer tu contraseña';
    
    $message = "
    <html>
    <head>
      <meta charset='UTF-8'>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .otp-box { font-size: 28px; font-weight: bold; letter-spacing: 6px; 
                   padding: 12px 16px; background: #f3f4f6; display: inline-block; 
                   border-radius: 10px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class='container'>
        <h2>Restablecer contraseña</h2>
        <p>Hola {$toName},</p>
        <p>Tu código de verificación es:</p>
        <div class='otp-box'>{$otp}</div>
        <p>Este código expira en <b>{$ttl} minutos</b> y solo puede usarse una vez.</p>
        <p>Si no solicitaste esto, puedes ignorar este correo.</p>
        <div class='footer'>
          <p>Este es un correo automático, por favor no respondas.</p>
        </div>
      </div>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: Meridian Control <no-reply@meridian-control.com>" . "\r\n";

    // En desarrollo, también loguear el OTP para facilitar pruebas
    if (defined('APP_DEBUG') && APP_DEBUG) {
      error_log("Password Reset OTP for {$toEmail}: {$otp}");
    }

    @mail($toEmail, $subject, $message, $headers);
  }

  private function getEmailTemplate(string $otp, int $ttl): string
  {
    return "
    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
      <h2 style='color: #1e40af;'>Restablecer contraseña</h2>
      <p>Tu código de verificación es:</p>
      <div style='font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 16px; background: #f3f4f6; display: inline-block; border-radius: 10px; margin: 20px 0;'>
        {$otp}
      </div>
      <p style='margin-top: 16px;'>Este código expira en <b>{$ttl} minutos</b> y solo puede usarse una vez.</p>
      <p>Si no solicitaste esto, puedes ignorar este correo.</p>
      <div style='margin-top: 30px; font-size: 12px; color: #666;'>
        <p>Este es un correo automático, por favor no respondas.</p>
      </div>
    </div>
    ";
  }
}

