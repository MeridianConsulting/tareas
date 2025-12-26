<?php
/**
 * Script para crear usuarios de prueba para cada rol
 */

require __DIR__ . '/../src/Config/config.php';

use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();

    $usuarios = [
        [
            'name' => 'Lider IT',
            'email' => 'lider@empresa.com',
            'password' => 'lider123',
            'role_id' => 3,  // lider_area
            'area_id' => 1   // IT
        ],
        [
            'name' => 'Juan Colaborador',
            'email' => 'colaborador@empresa.com',
            'password' => 'colab123',
            'role_id' => 4,  // colaborador
            'area_id' => 1   // IT
        ],
    ];

    echo "Creando usuarios de prueba...\n\n";

    foreach ($usuarios as $u) {
        // Verificar si el usuario ya existe
        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$u['email']]);
        
        if ($stmt->fetch()) {
            echo "Usuario {$u['email']} ya existe, omitiendo...\n";
            continue;
        }

        $hash = password_hash($u['password'], PASSWORD_DEFAULT);
        $stmt = $db->prepare('INSERT INTO users (name, email, password_hash, role_id, area_id, is_active) VALUES (?, ?, ?, ?, ?, 1)');
        $stmt->execute([$u['name'], $u['email'], $hash, $u['role_id'], $u['area_id']]);
        
        echo "Creado: {$u['name']}\n";
        echo "  Email: {$u['email']}\n";
        echo "  Password: {$u['password']}\n";
        echo "  Rol ID: {$u['role_id']}\n\n";
    }

    echo "========================================\n";
    echo "Usuarios de prueba creados exitosamente!\n";
    echo "========================================\n\n";
    
    echo "Credenciales:\n";
    echo "- lider@empresa.com / lider123 (Lider de Area)\n";
    echo "- colaborador@empresa.com / colab123 (Colaborador)\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}

