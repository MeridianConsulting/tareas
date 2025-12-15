<?php
/**
 * Script para actualizar la contraseña del usuario admin
 * Ejecutar desde línea de comandos: php scripts/update_admin_password.php
 */

require __DIR__ . '/../src/Config/config.php';

use App\Core\Database;
use App\Repositories\UserRepository;

try {
    $db = Database::getInstance()->getConnection();
    $userRepo = new UserRepository();

    // Buscar usuario admin
    $admin = $userRepo->findByEmail('admin@empresa.com');
    
    if (!$admin) {
        echo "ERROR: Usuario admin@empresa.com no encontrado\n";
        echo "Ejecuta primero el script create_admin.php\n";
        exit(1);
    }

    // Generar nuevo hash para "admin123"
    $passwordHash = password_hash('admin123', PASSWORD_DEFAULT);
    
    // Actualizar contraseña
    $userRepo->update($admin['id'], ['password_hash' => $passwordHash]);
    
    echo "✓ Contraseña del usuario admin actualizada exitosamente\n";
    echo "\n";
    echo "========================================\n";
    echo "Credenciales de acceso:\n";
    echo "Email: admin@empresa.com\n";
    echo "Password: admin123\n";
    echo "========================================\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

