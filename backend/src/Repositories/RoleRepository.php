<?php

namespace App\Repositories;

use App\Core\Database;

class RoleRepository
{
  private $db;

  public function __construct()
  {
    $this->db = Database::getInstance()->getConnection();
  }

  public function findAll(): array
  {
    $stmt = $this->db->query("SELECT * FROM roles ORDER BY id");
    return $stmt->fetchAll();
  }

  public function findById(int $id): ?array
  {
    $stmt = $this->db->prepare("SELECT * FROM roles WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $role = $stmt->fetch();
    return $role ?: null;
  }

  public function findByName(string $name): ?array
  {
    $stmt = $this->db->prepare("SELECT * FROM roles WHERE name = :name");
    $stmt->execute([':name' => $name]);
    $role = $stmt->fetch();
    return $role ?: null;
  }
}

