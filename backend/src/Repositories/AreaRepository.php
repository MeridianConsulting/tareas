<?php

namespace App\Repositories;

use App\Core\Database;

class AreaRepository
{
  private $db;

  public function __construct()
  {
    $this->db = Database::getInstance()->getConnection();
  }

  public function findAll(): array
  {
    $stmt = $this->db->query("SELECT * FROM areas ORDER BY name");
    return $stmt->fetchAll();
  }

  public function findById(int $id): ?array
  {
    $stmt = $this->db->prepare("SELECT * FROM areas WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $area = $stmt->fetch();
    return $area ?: null;
  }

  public function create(array $data): int
  {
    $sql = "INSERT INTO areas (name, code, type, parent_id) VALUES (:name, :code, :type, :parent_id)";
    $stmt = $this->db->prepare($sql);
    $stmt->execute([
      ':name' => $data['name'],
      ':code' => $data['code'],
      ':type' => $data['type'] ?? 'AREA',
      ':parent_id' => $data['parent_id'] ?? null,
    ]);

    return (int) $this->db->lastInsertId();
  }

  public function update(int $id, array $data): bool
  {
    $allowedFields = ['name', 'code', 'type', 'parent_id', 'is_active'];
    $updates = [];

    foreach ($allowedFields as $field) {
      if (isset($data[$field])) {
        $updates[] = "$field = :$field";
      }
    }

    if (empty($updates)) {
      return false;
    }

    $sql = "UPDATE areas SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $this->db->prepare($sql);

    $params = [':id' => $id];
    foreach ($allowedFields as $field) {
      if (isset($data[$field])) {
        $params[":$field"] = $data[$field];
      }
    }

    return $stmt->execute($params);
  }
}

