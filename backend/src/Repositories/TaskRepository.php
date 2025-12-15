<?php

namespace App\Repositories;

use App\Core\Database;

class TaskRepository
{
  private $db;

  public function __construct()
  {
    $this->db = Database::getInstance()->getConnection();
  }

  public function findAll(array $filters = [], array $userContext = []): array
  {
    $sql = "
      SELECT t.*, a.name as area_name, u.name as responsible_name
      FROM tasks t
      LEFT JOIN areas a ON t.area_id = a.id
      LEFT JOIN users u ON t.responsible_id = u.id
      WHERE 1=1
    ";

    $params = [];

    // Aplicar filtros de permisos según rol
    $role = $userContext['role'] ?? null;
    $userId = $userContext['id'] ?? null;
    $areaId = $userContext['area_id'] ?? null;

    if ($role === 'lider_area' && $areaId) {
      $sql .= " AND t.area_id = :user_area_id";
      $params[':user_area_id'] = $areaId;
    } elseif ($role === 'colaborador' && $userId) {
      $sql .= " AND t.responsible_id = :user_id";
      $params[':user_id'] = $userId;
    }
    // admin y gerencia ven todo, no se agrega restricción

    // Filtros opcionales
    if (isset($filters['status'])) {
      $sql .= " AND t.status = :status";
      $params[':status'] = $filters['status'];
    }

    if (isset($filters['priority'])) {
      $sql .= " AND t.priority = :priority";
      $params[':priority'] = $filters['priority'];
    }

    if (isset($filters['type'])) {
      $sql .= " AND t.type = :type";
      $params[':type'] = $filters['type'];
    }

    if (isset($filters['area_id'])) {
      $sql .= " AND t.area_id = :area_id";
      $params[':area_id'] = $filters['area_id'];
    }

    if (isset($filters['responsible_id'])) {
      $sql .= " AND t.responsible_id = :responsible_id";
      $params[':responsible_id'] = $filters['responsible_id'];
    }

    $sql .= " ORDER BY t.updated_at DESC";

    try {
      $stmt = $this->db->prepare($sql);
      $stmt->execute($params);
      return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    } catch (\PDOException $e) {
      error_log('TaskRepository::findAll error: ' . $e->getMessage());
      error_log('SQL: ' . $sql);
      error_log('Params: ' . json_encode($params));
      throw new \Exception('Database error: ' . $e->getMessage());
    }
  }

  public function findById(int $id, array $userContext = []): ?array
  {
    $sql = "
      SELECT t.*, a.name as area_name, u.name as responsible_name
      FROM tasks t
      LEFT JOIN areas a ON t.area_id = a.id
      LEFT JOIN users u ON t.responsible_id = u.id
      WHERE t.id = :id
    ";

    $params = [':id' => $id];

    // Aplicar filtros de permisos
    $role = $userContext['role'] ?? null;
    $userId = $userContext['id'] ?? null;
    $areaId = $userContext['area_id'] ?? null;

    if ($role === 'lider_area' && $areaId) {
      $sql .= " AND t.area_id = :user_area_id";
      $params[':user_area_id'] = $areaId;
    } elseif ($role === 'colaborador' && $userId) {
      $sql .= " AND t.responsible_id = :user_id";
      $params[':user_id'] = $userId;
    }

    try {
      $stmt = $this->db->prepare($sql);
      $stmt->execute($params);
      $task = $stmt->fetch(\PDO::FETCH_ASSOC);

      return $task ?: null;
    } catch (\PDOException $e) {
      error_log('TaskRepository::findById error: ' . $e->getMessage());
      error_log('SQL: ' . $sql);
      error_log('Params: ' . json_encode($params));
      throw new \Exception('Database error: ' . $e->getMessage());
    }
  }

  public function create(array $data): int
  {
    $sql = "
      INSERT INTO tasks (
        area_id, title, description, type, priority, status,
        progress_percent, responsible_id, created_by,
        start_date, due_date
      ) VALUES (
        :area_id, :title, :description, :type, :priority, :status,
        :progress_percent, :responsible_id, :created_by,
        :start_date, :due_date
      )
    ";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([
      ':area_id' => $data['area_id'],
      ':title' => $data['title'],
      ':description' => $data['description'] ?? null,
      ':type' => $data['type'] ?? 'Operativa',
      ':priority' => $data['priority'] ?? 'Media',
      ':status' => $data['status'] ?? 'No iniciada',
      ':progress_percent' => $data['progress_percent'] ?? 0,
      ':responsible_id' => $data['responsible_id'],
      ':created_by' => $data['created_by'],
      ':start_date' => $data['start_date'] ?? null,
      ':due_date' => $data['due_date'] ?? null,
    ]);

    return (int) $this->db->lastInsertId();
  }

  public function update(int $id, array $data): bool
  {
    $allowedFields = [
      'title', 'description', 'type', 'priority', 'status',
      'progress_percent', 'responsible_id', 'area_id',
      'start_date', 'due_date', 'closed_date'
    ];

    $updates = [];
    foreach ($allowedFields as $field) {
      if (isset($data[$field])) {
        $updates[] = "$field = :$field";
      }
    }

    if (empty($updates)) {
      return false;
    }

    $sql = "UPDATE tasks SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $this->db->prepare($sql);

    $params = [':id' => $id];
    foreach ($allowedFields as $field) {
      if (isset($data[$field])) {
        $params[":$field"] = $data[$field];
      }
    }

    return $stmt->execute($params);
  }

  public function delete(int $id): bool
  {
    $stmt = $this->db->prepare("DELETE FROM tasks WHERE id = :id");
    return $stmt->execute([':id' => $id]);
  }
}

