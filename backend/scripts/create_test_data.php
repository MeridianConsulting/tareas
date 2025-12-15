<?php
/**
 * Script para crear datos de prueba (usuarios y tareas)
 * 10 tareas por cada area = 90 tareas totales
 */

require __DIR__ . '/../src/Config/config.php';

use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();

    echo "===========================================\n";
    echo "   CREANDO DATOS DE PRUEBA\n";
    echo "===========================================\n\n";

    // =====================================================
    // PARTE 1: Crear usuarios para cada area
    // =====================================================
    
    $areas = [
        1 => 'IT',
        2 => 'ADMINISTRACION',
        3 => 'HSEQ',
        4 => 'PROYECTO FRONTERA',
        5 => 'CW',
        6 => 'PETROSERVICIOS',
        7 => 'CONTABILIDAD',
        8 => 'GESTION HUMANA',
        9 => 'GERENCIA'
    ];

    $usuariosCreados = [];

    echo "1. Creando usuarios por area...\n";
    echo "--------------------------------\n";

    foreach ($areas as $areaId => $areaName) {
        $email = 'usuario' . $areaId . '@empresa.com';
        
        // Verificar si existe
        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            $usuariosCreados[$areaId] = $existing['id'];
            echo "   Usuario area {$areaName} ya existe (ID: {$existing['id']})\n";
        } else {
            $nombre = "Usuario " . $areaName;
            $hash = password_hash('test123', PASSWORD_DEFAULT);
            
            $stmt = $db->prepare('INSERT INTO users (name, email, password_hash, role_id, area_id, is_active) VALUES (?, ?, ?, 4, ?, 1)');
            $stmt->execute([$nombre, $email, $hash, $areaId]);
            $userId = $db->lastInsertId();
            $usuariosCreados[$areaId] = $userId;
            echo "   Creado: {$nombre} (ID: {$userId})\n";
        }
    }

    // Obtener el admin (user 2) para created_by
    $adminId = 2;

    // =====================================================
    // PARTE 2: Crear 10 tareas por area
    // =====================================================
    
    echo "\n2. Creando tareas por area (10 por cada una)...\n";
    echo "------------------------------------------------\n";

    $tipos = ['Clave', 'Operativa', 'Mejora', 'Obligatoria'];
    $prioridades = ['Alta', 'Media', 'Baja'];
    $estados = ['No iniciada', 'En progreso', 'En revision', 'Completada', 'En riesgo'];

    // Templates de tareas por area
    $tareasTemplate = [
        1 => [ // IT
            ['Actualizar servidores de produccion', 'Aplicar parches de seguridad y actualizaciones del sistema operativo'],
            ['Implementar backup automatico', 'Configurar respaldos diarios en la nube'],
            ['Revisar firewall corporativo', 'Auditar reglas y puertos abiertos'],
            ['Migrar base de datos', 'Migrar de MySQL 5.7 a MySQL 8.0'],
            ['Documentar arquitectura de red', 'Crear diagramas y documentacion tecnica'],
            ['Configurar VPN para teletrabajo', 'Implementar OpenVPN para acceso remoto'],
            ['Optimizar consultas SQL', 'Mejorar rendimiento de queries lentas'],
            ['Renovar certificados SSL', 'Actualizar certificados antes de vencimiento'],
            ['Implementar monitoreo de servicios', 'Configurar alertas con Prometheus/Grafana'],
            ['Capacitar equipo en ciberseguridad', 'Workshop de buenas practicas de seguridad'],
        ],
        2 => [ // ADMINISTRACION
            ['Actualizar manual de procedimientos', 'Revisar y actualizar SOPs del area'],
            ['Renovar contratos con proveedores', 'Negociar condiciones para 2025'],
            ['Implementar sistema de archivo digital', 'Digitalizar documentos fisicos'],
            ['Optimizar proceso de compras', 'Reducir tiempos de aprobacion'],
            ['Auditar inventario de activos', 'Verificar inventario de equipos y mobiliario'],
            ['Actualizar polizas de seguros', 'Revisar coberturas actuales'],
            ['Gestionar licencias de software', 'Renovar licencias Microsoft y Adobe'],
            ['Coordinar mantenimiento de oficinas', 'Programar limpieza y reparaciones'],
            ['Revisar contratos de arrendamiento', 'Evaluar condiciones actuales'],
            ['Elaborar presupuesto anual', 'Preparar proyeccion de gastos 2025'],
        ],
        3 => [ // HSEQ
            ['Realizar simulacro de evacuacion', 'Coordinar simulacro trimestral'],
            ['Actualizar matriz de riesgos', 'Identificar nuevos peligros y controles'],
            ['Capacitar brigada de emergencias', 'Entrenamiento en primeros auxilios'],
            ['Auditar uso de EPP', 'Verificar cumplimiento en campo'],
            ['Revisar plan de emergencias', 'Actualizar procedimientos y contactos'],
            ['Implementar programa 5S', 'Metodologia de orden y limpieza'],
            ['Realizar mediciones ambientales', 'Ruido, iluminacion y calidad del aire'],
            ['Actualizar COPASST', 'Reunion mensual del comite'],
            ['Investigar incidente de trabajo', 'Analisis de causa raiz'],
            ['Certificar ISO 45001', 'Preparar documentacion para auditoria'],
        ],
        4 => [ // PROYECTO FRONTERA
            ['Revisar cronograma del proyecto', 'Actualizar hitos y entregables'],
            ['Coordinar con contratistas', 'Reunion de seguimiento semanal'],
            ['Gestionar permisos ambientales', 'Tramitar licencias ante autoridades'],
            ['Elaborar informe de avance', 'Reporte mensual para stakeholders'],
            ['Controlar presupuesto del proyecto', 'Seguimiento a ejecucion vs planeado'],
            ['Actualizar matriz de stakeholders', 'Identificar nuevos interesados'],
            ['Gestionar cambios de alcance', 'Evaluar solicitudes de cambio'],
            ['Coordinar logistica de campo', 'Transporte y alimentacion del personal'],
            ['Revisar contratos de obra', 'Verificar cumplimiento de clausulas'],
            ['Preparar cierre de fase', 'Documentar lecciones aprendidas'],
        ],
        5 => [ // CW
            ['Optimizar rutas de distribucion', 'Reducir tiempos de entrega'],
            ['Capacitar operadores de montacargas', 'Certificacion de manejo seguro'],
            ['Implementar sistema WMS', 'Gestion de inventario en tiempo real'],
            ['Auditar inventario de bodega', 'Conteo fisico trimestral'],
            ['Mejorar layout del almacen', 'Reorganizar zonas de picking'],
            ['Revisar politicas de inventario', 'Definir niveles minimos y maximos'],
            ['Gestionar devoluciones', 'Procesar productos devueltos'],
            ['Coordinar despachos prioritarios', 'Envios urgentes a clientes VIP'],
            ['Implementar codigo de barras', 'Trazabilidad de productos'],
            ['Reducir mermas y perdidas', 'Plan de accion contra robos'],
        ],
        6 => [ // PETROSERVICIOS
            ['Programar mantenimiento preventivo', 'Equipos de perforacion'],
            ['Gestionar certificaciones API', 'Renovar certificados de equipos'],
            ['Coordinar movilizacion de equipos', 'Logistica hacia pozo activo'],
            ['Elaborar cotizaciones de servicio', 'Propuestas para nuevos clientes'],
            ['Capacitar tecnicos de campo', 'Entrenamiento en nuevos equipos'],
            ['Revisar contratos de servicio', 'Actualizar tarifas y condiciones'],
            ['Gestionar repuestos criticos', 'Inventario de partes de alta rotacion'],
            ['Documentar procedimientos operativos', 'Actualizar manuales tecnicos'],
            ['Coordinar con operadoras', 'Reunion de planeacion semanal'],
            ['Analizar indicadores de servicio', 'KPIs de tiempo de respuesta'],
        ],
        7 => [ // CONTABILIDAD
            ['Cerrar mes contable', 'Conciliaciones y ajustes de cierre'],
            ['Presentar declaracion de renta', 'Preparar y radicar formularios'],
            ['Conciliar cuentas bancarias', 'Verificar movimientos del mes'],
            ['Gestionar cartera vencida', 'Cobro a clientes morosos'],
            ['Elaborar estados financieros', 'Balance y P&G mensual'],
            ['Auditar cuentas por pagar', 'Verificar facturas pendientes'],
            ['Actualizar plan de cuentas', 'Adecuar estructura contable'],
            ['Preparar informacion exogena', 'Reportes a la DIAN'],
            ['Revisar retenciones aplicadas', 'Verificar tarifas correctas'],
            ['Capacitar en NIIF', 'Actualizacion normativa contable'],
        ],
        8 => [ // GESTION HUMANA
            ['Publicar vacantes abiertas', 'Proceso de reclutamiento activo'],
            ['Realizar evaluaciones de desempeno', 'Ciclo anual de feedback'],
            ['Actualizar manual de convivencia', 'Revisar politicas internas'],
            ['Gestionar nomina quincenal', 'Calculo y pago de salarios'],
            ['Coordinar capacitaciones', 'Plan de formacion anual'],
            ['Procesar novedades de nomina', 'Incapacidades, vacaciones, etc'],
            ['Actualizar organigrama', 'Reflejar cambios estructurales'],
            ['Gestionar clima organizacional', 'Encuesta de satisfaccion'],
            ['Coordinar eventos de bienestar', 'Actividades de integracion'],
            ['Revisar politica de teletrabajo', 'Actualizar lineamientos'],
        ],
        9 => [ // GERENCIA
            ['Revisar indicadores estrategicos', 'Dashboard de KPIs gerenciales'],
            ['Preparar junta directiva', 'Informe trimestral de gestion'],
            ['Definir presupuesto 2025', 'Proyecciones financieras'],
            ['Evaluar nuevos proyectos', 'Analisis de viabilidad'],
            ['Coordinar comite de gerencia', 'Reunion semanal de lideres'],
            ['Revisar plan estrategico', 'Seguimiento a objetivos anuales'],
            ['Gestionar alianzas comerciales', 'Negociacion con socios'],
            ['Autorizar inversiones mayores', 'CAPEX superior a 100M'],
            ['Revisar politicas corporativas', 'Actualizacion de lineamientos'],
            ['Preparar asamblea de accionistas', 'Documentacion legal requerida'],
        ],
    ];

    $totalTareas = 0;

    foreach ($areas as $areaId => $areaName) {
        echo "\n   Area: {$areaName}\n";
        
        $responsibleId = $usuariosCreados[$areaId];
        $tareas = $tareasTemplate[$areaId];
        
        foreach ($tareas as $index => $tarea) {
            $titulo = $tarea[0];
            $descripcion = $tarea[1];
            
            // Variar tipo, prioridad, estado y progreso
            $tipo = $tipos[$index % count($tipos)];
            $prioridad = $prioridades[$index % count($prioridades)];
            $estado = $estados[$index % count($estados)];
            
            // Progreso basado en estado
            $progreso = match($estado) {
                'No iniciada' => 0,
                'En progreso' => rand(20, 60),
                'En revision' => rand(70, 90),
                'Completada' => 100,
                'En riesgo' => rand(10, 40),
                default => 0
            };
            
            // Fechas
            $startDate = date('Y-m-d', strtotime('-' . rand(1, 30) . ' days'));
            $dueDate = date('Y-m-d', strtotime('+' . rand(1, 60) . ' days'));
            
            // Algunas tareas vencidas para probar el diseno
            if ($index % 5 === 0 && $estado !== 'Completada') {
                $dueDate = date('Y-m-d', strtotime('-' . rand(1, 10) . ' days'));
            }
            
            $stmt = $db->prepare('
                INSERT INTO tasks (area_id, title, description, type, priority, status, progress_percent, responsible_id, created_by, start_date, due_date) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');
            
            $stmt->execute([
                $areaId,
                $titulo,
                $descripcion,
                $tipo,
                $prioridad,
                $estado,
                $progreso,
                $responsibleId,
                $adminId,
                $startDate,
                $dueDate
            ]);
            
            $totalTareas++;
        }
        
        echo "      10 tareas creadas\n";
    }

    echo "\n===========================================\n";
    echo "   RESUMEN\n";
    echo "===========================================\n";
    echo "   Usuarios creados/verificados: " . count($usuariosCreados) . "\n";
    echo "   Tareas creadas: {$totalTareas}\n";
    echo "===========================================\n\n";

    echo "Credenciales de usuarios de prueba:\n";
    echo "-----------------------------------\n";
    foreach ($areas as $areaId => $areaName) {
        echo "   usuario{$areaId}@empresa.com / test123 ({$areaName})\n";
    }
    echo "\n   admin@empresa.com / password (Administrador)\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}

