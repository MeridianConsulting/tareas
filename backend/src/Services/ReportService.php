<?php

namespace App\Services;

use App\Core\Database;

class ReportService
{
  private $db;

  public function __construct()
  {
    $this->db = Database::getInstance()->getConnection();
  }

  public function getDailyReport(?string $date = null, ?int $areaId = null, array $userContext = []): array
  {
    $date = $date ?: date('Y-m-d');
    $role = $userContext['role'] ?? null;
    $userAreaId = $userContext['area_id'] ?? null;

    // Restricción por área si es lider_area
    $areaFilter = '';
    $params = [':date' => $date];

    if ($role === 'lider_area' && $userAreaId) {
      $areaFilter = " AND t.area_id = :user_area_id";
      $params[':user_area_id'] = $userAreaId;
    } elseif ($areaId) {
      $areaFilter = " AND t.area_id = :area_id";
      $params[':area_id'] = $areaId;
    }

    // Estadísticas
    $statsSql = "
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completada' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'En riesgo' THEN 1 ELSE 0 END) as at_risk,
        AVG(progress_percent) as avg_progress
      FROM tasks t
      WHERE DATE(updated_at) = :date
      $areaFilter
    ";

    $stmt = $this->db->prepare($statsSql);
    $stmt->execute($params);
    $stats = $stmt->fetch();

    // Tareas del día
    $tasksSql = "
      SELECT t.*, a.name as area_name, u.name as responsible_name
      FROM tasks t
      LEFT JOIN areas a ON t.area_id = a.id
      LEFT JOIN users u ON t.responsible_id = u.id
      WHERE DATE(t.updated_at) = :date
      $areaFilter
      ORDER BY t.updated_at DESC
    ";

    $stmt = $this->db->prepare($tasksSql);
    $stmt->execute($params);
    $tasks = $stmt->fetchAll();

    return [
      'stats' => [
        'total' => (int)($stats['total'] ?? 0),
        'completed' => (int)($stats['completed'] ?? 0),
        'at_risk' => (int)($stats['at_risk'] ?? 0),
        'avg_progress' => round((float)($stats['avg_progress'] ?? 0), 2),
      ],
      'tasks' => $tasks,
    ];
  }

  public function getManagementReport(?string $dateFrom = null, ?string $dateTo = null): array
  {
    // Construir filtro de fecha
    $dateFilter = '';
    $params = [];
    
    if ($dateFrom && $dateTo) {
      $dateFilter = " WHERE DATE(created_at) BETWEEN :date_from AND :date_to";
      $params = [':date_from' => $dateFrom, ':date_to' => $dateTo];
    } elseif ($dateFrom) {
      $dateFilter = " WHERE DATE(created_at) >= :date_from";
      $params = [':date_from' => $dateFrom];
    } elseif ($dateTo) {
      $dateFilter = " WHERE DATE(created_at) <= :date_to";
      $params = [':date_to' => $dateTo];
    }

    // Estadísticas generales
    $generalSql = "
      SELECT
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'Completada' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'En riesgo' THEN 1 ELSE 0 END) as at_risk,
        SUM(CASE WHEN due_date < CURDATE() AND status != 'Completada' THEN 1 ELSE 0 END) as overdue
      FROM tasks
      $dateFilter
    ";

    $stmt = $this->db->prepare($generalSql);
    $stmt->execute($params);
    $general = $stmt->fetch();

    // Por área con filtro de fecha
    $areaDateFilter = $dateFilter ? str_replace('created_at', 't.created_at', $dateFilter) : '';
    $byAreaSql = "
      SELECT
        a.id,
        a.name as area_name,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'Completada' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN t.status = 'En riesgo' THEN 1 ELSE 0 END) as at_risk,
        SUM(CASE WHEN t.due_date < CURDATE() AND t.status != 'Completada' THEN 1 ELSE 0 END) as overdue,
        AVG(t.progress_percent) as avg_progress
      FROM areas a
      LEFT JOIN tasks t ON a.id = t.area_id " . ($areaDateFilter ? "AND " . substr($areaDateFilter, 7) : "") . "
      GROUP BY a.id, a.name
      ORDER BY a.name
    ";

    $stmt = $this->db->prepare($byAreaSql);
    $stmt->execute($params);
    $byArea = $stmt->fetchAll();

    // Por tipo con filtro de fecha
    $byTypeSql = "
      SELECT type, COUNT(*) as count
      FROM tasks
      $dateFilter
      GROUP BY type
      ORDER BY count DESC
    ";

    $stmt = $this->db->prepare($byTypeSql);
    $stmt->execute($params);
    $byType = $stmt->fetchAll();

    return [
      'general' => [
        'total_tasks' => (int)($general['total_tasks'] ?? 0),
        'completed' => (int)($general['completed'] ?? 0),
        'at_risk' => (int)($general['at_risk'] ?? 0),
        'overdue' => (int)($general['overdue'] ?? 0),
      ],
      'by_area' => array_map(function($area) {
        return [
          'id' => (int)$area['id'],
          'area_name' => $area['area_name'],
          'total_tasks' => (int)($area['total_tasks'] ?? 0),
          'completed' => (int)($area['completed'] ?? 0),
          'at_risk' => (int)($area['at_risk'] ?? 0),
          'overdue' => (int)($area['overdue'] ?? 0),
          'avg_progress' => round((float)($area['avg_progress'] ?? 0), 2),
        ];
      }, $byArea),
      'by_type' => array_map(function($type) {
        return [
          'type' => $type['type'],
          'count' => (int)$type['count'],
        ];
      }, $byType),
      'date_range' => [
        'from' => $dateFrom,
        'to' => $dateTo
      ]
    ];
  }
}

