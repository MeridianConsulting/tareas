<?php

namespace App\Core;

use PDO;
use PDOException;

class Database
{
  private static $instance = null;
  private $connection;

  private function __construct()
  {
    try {
      $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        DB_HOST,
        DB_NAME
      );

      $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
      ];

      $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
      if (APP_DEBUG) {
        throw new \Exception('Database connection failed: ' . $e->getMessage());
      }
      throw new \Exception('Database connection failed');
    }
  }

  public static function getInstance(): self
  {
    if (self::$instance === null) {
      self::$instance = new self();
    }
    return self::$instance;
  }

  public function getConnection(): PDO
  {
    return $this->connection;
  }

  // Prevenir clonación
  private function __clone() {}

  // Prevenir deserialización
  public function __wakeup()
  {
    throw new \Exception('Cannot unserialize singleton');
  }
}

