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
    $user = $stmt->fetch();

    return $user ?: null;
  }

  public function findById(int $id): ?array
  {
    $stmt = $this->db->prepare("
      SELECT u.*, r.name as role_name, a.name as area_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN areas a ON u.area_id = a.id
      WHERE u.id = :id
    ");
    $stmt->execute([':id' => $id]);
    $user = $stmt->fetch();

    return $user ?: null;
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
    return $stmt->fetchAll();
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
}

