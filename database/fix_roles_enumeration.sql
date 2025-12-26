-- Script para reenumerar los roles del 1 al 3
-- Elimina el gap dejado por el rol "gerencia" (id=2) que fue eliminado
-- 
-- Estado actual:
--   id 1: admin
--   id 3: lider_area
--   id 4: colaborador
--
-- Estado deseado:
--   id 1: admin
--   id 2: lider_area
--   id 3: colaborador

-- IMPORTANTE: Este script debe ejecutarse en una transacción para garantizar consistencia

START TRANSACTION;

-- Desactivar temporalmente las verificaciones de foreign keys
SET FOREIGN_KEY_CHECKS = 0;

-- Paso 1: Crear roles temporales con id 99 y 98 para usar como puente
INSERT INTO roles (id, name, description) VALUES (99, 'temp_role_1', 'Rol temporal para migración lider_area')
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO roles (id, name, description) VALUES (98, 'temp_role_2', 'Rol temporal para migración colaborador')
ON DUPLICATE KEY UPDATE name = name;

-- Paso 2: Actualizar los usuarios que tienen role_id = 3 (lider_area) al rol temporal (99)
UPDATE users SET role_id = 99 WHERE role_id = 3;

-- Paso 3: Actualizar el ID del rol lider_area de 3 a 2 (ahora que no hay usuarios con role_id = 3)
UPDATE roles SET id = 2 WHERE id = 3 AND name = 'lider_area';

-- Paso 4: Actualizar los usuarios que tienen role_id = 99 (lider_area temporal) a 2
UPDATE users SET role_id = 2 WHERE role_id = 99;

-- Paso 5: Actualizar los usuarios que tienen role_id = 4 (colaborador) al rol temporal (98)
UPDATE users SET role_id = 98 WHERE role_id = 4;

-- Paso 6: Actualizar el ID del rol colaborador de 4 a 3 (ahora que no hay usuarios con role_id = 4)
UPDATE roles SET id = 3 WHERE id = 4 AND name = 'colaborador';

-- Paso 7: Actualizar los usuarios que tienen role_id = 98 (colaborador temporal) a 3
UPDATE users SET role_id = 3 WHERE role_id = 98;

-- Paso 8: Eliminar los roles temporales
DELETE FROM roles WHERE id = 99 AND name = 'temp_role_1';
DELETE FROM roles WHERE id = 98 AND name = 'temp_role_2';

-- Paso 9: Actualizar el AUTO_INCREMENT de la tabla roles para que el próximo ID sea 4
ALTER TABLE roles AUTO_INCREMENT = 4;

-- Reactivar las verificaciones de foreign keys
SET FOREIGN_KEY_CHECKS = 1;

-- Confirmar la transacción
COMMIT;

-- Verificación: Mostrar los roles actualizados
SELECT id, name, description FROM roles ORDER BY id;

-- Verificación: Contar usuarios por rol
SELECT r.id, r.name, COUNT(u.id) as user_count
FROM roles r
LEFT JOIN users u ON r.id = u.role_id
GROUP BY r.id, r.name
ORDER BY r.id;

