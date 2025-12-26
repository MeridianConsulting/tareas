<?php
/**
 * Script para generar secretos seguros para JWT y APP_KEY
 * 
 * Uso: php scripts/generate_secret.php
 */

echo "========================================\n";
echo "Generador de Secretos Seguros\n";
echo "========================================\n\n";

// Generar JWT_SECRET (64 caracteres hexadecimales = 32 bytes)
$jwtSecret = bin2hex(random_bytes(32));
echo "JWT_SECRET=\n";
echo $jwtSecret . "\n\n";

// Generar APP_KEY (64 caracteres hexadecimales = 32 bytes)
$appKey = bin2hex(random_bytes(32));
echo "APP_KEY=\n";
echo $appKey . "\n\n";

echo "========================================\n";
echo "INSTRUCCIONES:\n";
echo "========================================\n";
echo "1. Copia estos valores a tu archivo .env\n";
echo "2. Reemplaza los valores actuales de JWT_SECRET y APP_KEY\n";
echo "3. IMPORTANTE: No compartas estos secretos\n";
echo "4. Si ya tienes usuarios activos, cambiar JWT_SECRET\n";
echo "   invalidará todas las sesiones activas\n";
echo "========================================\n";

