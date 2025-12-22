<?php

namespace App\Repositories;

use App\Core\Database;

class UserRepository
{
  private $db;

  public function __construct()
  {
    $this->db = Database::getInstance()->getConnection();
  }

  public function findByEmail(string $email): ?array
  {
    $stmt = $this->db->prepare("
      SELECT u.*, r.name as role_name, a.name as area_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN areas a ON u.area_id = a.id
      WHERE u.email = :email
    ");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(\PDO::FETCH_ASSOC);

    return $user ?: null;
  }

  public function findById(int $id): ?array
  {
    try {
      $stmt = $this->db->prepare("
        SELECT u.*, r.name as role_name, a.name as area_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN areas a ON u.area_id = a.id
        WHERE u.id = :id
      ");
      $stmt->execute([':id' => $id]);
      $user = $stmt->fetch(\PDO::FETCH_ASSOC);

      return $user ?: null;
    } catch (\PDOException $e) {
      error_log('UserRepository::findById error: ' . $e->getMessage());
      error_log('SQL: SELECT u.*, r.name as role_name, a.name as area_name FROM users u LEFT JOIN roles r ON u.role_id = r.id LEFT JOIN areas a ON u.area_id = a.id WHERE u.id = ' . $id);
      throw new \Exception('Database error: ' . $e->getMessage());
    }
  }

  public function findAll(array $filters = []): array
  {
    $sql = "
      SELECT u.*, r.name as role_name, a.name as area_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN areas a ON u.area_id = a.id
      WHERE 1=1
    ";

    $params = [];

    if (isset($filters['is_active'])) {
      $sql .= " AND u.is_active = :is_active";
      $params[':is_active'] = $filters['is_active'];
    }

    $sql .= " ORDER BY u.created_at DESC";

    $stmt = $this->db->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
  }

  public function create(array $data): int
  {
    $sql = "
      INSERT INTO users (name, email, password_hash, role_id, area_id, is_active)
      VALUES (:name, :email, :password_hash, :role_id, :area_id, :is_active)
    ";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([
      ':name' => $data['name'],
      ':email' => $data['email'],
      ':password_hash' => $data['password_hash'],
      ':role_id' => $data['role_id'],
      ':area_id' => $data['area_id'] ?? null,
      ':is_active' => $data['is_active'] ?? 1,
    ]);

    return (int) $this->db->lastInsertId();
  }

  public function update(int $id, array $data): bool
  {
    $allowedFields = ['name', 'email', 'password_hash', 'role_id', 'area_id', 'is_active'];
    $updates = [];

    foreach ($allowedFields as $field) {
      if (isset($data[$field])) {
        $updates[] = "$field = :$field";
      }
    }

    if (empty($updates)) {
      return false;
    }

    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
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
    $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");
    return $stmt->execute([':id' => $id]);
  }

  public function hasTasks(int $id): bool
  {
    $stmt = $this->db->prepare("SELECT COUNT(*) FROM tasks WHERE responsible_id = :id OR created_by = :id2");
    $stmt->execute([':id' => $id, ':id2' => $id]);
    return (int)$stmt->fetchColumn() > 0;
  }

  public function updatePasswordHash(int $id, string $passwordHash): bool
  {
    $stmt = $this->db->prepare("UPDATE users SET password_hash = :password_hash WHERE id = :id");
    return $stmt->execute([
      ':id' => $id,
      ':password_hash' => $passwordHash,
    ]);
  }
}

