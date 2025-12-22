<?php

namespace App\Services;

class MailService
{
  public function sendPasswordResetOtp(string $toEmail, string $toName, string $otp): void
  {
    // Intentar usar SMTP si está configurado y PHPMailer está disponible
    $smtpHost = getenv('SMTP_HOST') ?: ($_ENV['SMTP_HOST'] ?? null);
    
    if ($smtpHost && class_exists('PHPMailer\PHPMailer\PHPMailer')) {
      $this->sendViaSmtp($toEmail, $toName, $otp);
    } else {
      // Fallback a mail() nativo para desarrollo local
      if (defined('APP_DEBUG') && APP_DEBUG) {
        error_log("MailService: SMTP_HOST no configurado o PHPMailer no disponible. Usando mail() nativo.");
        error_log("SMTP_HOST=" . ($smtpHost ?: 'NULL'));
      }
      $this->sendViaNativeMail($toEmail, $toName, $otp);
    }
  }

  private function sendViaSmtp(string $toEmail, string $toName, string $otp): void
  {
    try {
      $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

      // DEBUG (solo en desarrollo)
      if (defined('APP_DEBUG') && APP_DEBUG) {
        $mail->SMTPDebug = 2; // 0=off, 1=client, 2=client+server
        $mail->Debugoutput = function($str, $level) {
          error_log("SMTP[$level] $str");
        };
      }

      // Configuración SMTP
      $mail->isSMTP();
      $mail->Host = getenv('SMTP_HOST') ?: ($_ENV['SMTP_HOST'] ?? 'smtp.gmail.com');
      $mail->SMTPAuth = true;
      $mail->Username = getenv('SMTP_USER') ?: ($_ENV['SMTP_USER'] ?? '');
      $mail->Password = getenv('SMTP_PASS') ?: ($_ENV['SMTP_PASS'] ?? '');
      
      $port = (int)(getenv('SMTP_PORT') ?: ($_ENV['SMTP_PORT'] ?? 587));
      $mail->Port = $port;

      // Configurar encriptación según puerto y variable SMTP_SECURE
      $secure = strtolower(getenv('SMTP_SECURE') ?: ($_ENV['SMTP_SECURE'] ?? 'tls'));
      if ($secure === 'ssl' || $port === 465) {
        $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS; // SSL para puerto 465
      } else {
        $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS; // TLS para puerto 587
      }

      // Opcional: ajustar verificación SSL (solo si hay problemas de certificados)
      $mail->SMTPOptions = [
        'ssl' => [
          'verify_peer' => true,
          'verify_peer_name' => true,
          'allow_self_signed' => false,
        ],
      ];

      $mail->CharSet = 'UTF-8';

      // Remitente
      $fromEmail = getenv('MAIL_FROM') ?: ($_ENV['MAIL_FROM'] ?? 'no-reply@tu-dominio.com');
      $fromName = getenv('MAIL_FROM_NAME') ?: ($_ENV['MAIL_FROM_NAME'] ?? 'Meridian Control');
      $mail->setFrom($fromEmail, $fromName);
      $mail->addAddress($toEmail, $toName);

      // Contenido
      $mail->isHTML(true);
      $mail->Subject = 'Código para restablecer tu contraseña';

      $ttl = OTP_TTL_MINUTES;

      $mail->Body = $this->getEmailTemplate($otp, $ttl);
      $mail->AltBody = "Tu código para restablecer contraseña es: {$otp}. Expira en {$ttl} minutos.";

      $mail->send();
      
      if (defined('APP_DEBUG') && APP_DEBUG) {
        error_log("MailService: Correo enviado exitosamente a {$toEmail}");
      }
    } catch (\PHPMailer\PHPMailer\Exception $e) {
      error_log("MailService SMTP error: " . $e->getMessage());
      error_log("PHPMailer ErrorInfo: " . ($mail->ErrorInfo ?? 'N/A'));
      // Fallback a mail() nativo si SMTP falla
      if (defined('APP_DEBUG') && APP_DEBUG) {
        error_log("MailService: Fallback a mail() nativo debido a error SMTP");
      }
      $this->sendViaNativeMail($toEmail, $toName, $otp);
    } catch (\Throwable $e) {
      error_log("MailService error: " . $e->getMessage());
      error_log("Stack trace: " . $e->getTraceAsString());
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

    // Intentar enviar con mail() nativo (sin @ para ver errores)
    $ok = mail($toEmail, $subject, $message, $headers);
    
    if (defined('APP_DEBUG') && APP_DEBUG) {
      if ($ok) {
        error_log("Native mail() sent successfully to {$toEmail}");
      } else {
        error_log("Native mail() FAILED to send to {$toEmail}. Check PHP mail configuration.");
        $lastError = error_get_last();
        if ($lastError) {
          error_log("Last PHP error: " . $lastError['message']);
        }
      }
    }
    
    // En producción, si mail() falla, lanzar excepción para que se sepa
    if (!$ok && !defined('APP_DEBUG')) {
      error_log("WARNING: Native mail() failed for password reset OTP to {$toEmail}");
      // No lanzamos excepción para no romper el flujo, pero logueamos fuerte
    }
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

