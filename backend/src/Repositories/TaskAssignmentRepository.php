<?php

namespace App\Repositories;

use App\Core\Database;

class TaskAssignmentRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findAll(array $filters = []): array
    {
        $sql = "
            SELECT 
                ta.*,
                t.title as task_title,
                t.type as task_type,
                t.priority as task_priority,
                t.status as task_status,
                t.due_date as task_due_date,
                ub.name as assigned_by_name,
                ub.email as assigned_by_email,
                ut.name as assigned_to_name,
                ut.email as assigned_to_email,
                a.name as area_name
            FROM task_assignments ta
            INNER JOIN tasks t ON ta.task_id = t.id
            INNER JOIN users ub ON ta.assigned_by = ub.id
            INNER JOIN users ut ON ta.assigned_to = ut.id
            LEFT JOIN areas a ON t.area_id = a.id
            WHERE 1=1
        ";

        $params = [];

        if (isset($filters['assigned_to'])) {
            $sql .= " AND ta.assigned_to = :assigned_to";
            $params[':assigned_to'] = $filters['assigned_to'];
        }

        if (isset($filters['assigned_by'])) {
            $sql .= " AND ta.assigned_by = :assigned_by";
            $params[':assigned_by'] = $filters['assigned_by'];
        }

        if (isset($filters['is_read'])) {
            $sql .= " AND ta.is_read = :is_read";
            $params[':is_read'] = $filters['is_read'];
        }

        $sql .= " ORDER BY ta.created_at DESC";

        if (isset($filters['limit'])) {
            $sql .= " LIMIT " . (int)$filters['limit'];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $sql = "
            SELECT 
                ta.*,
                t.title as task_title,
                t.type as task_type,
                t.priority as task_priority,
                t.status as task_status,
                t.due_date as task_due_date,
                ub.name as assigned_by_name,
                ut.name as assigned_to_name,
                a.name as area_name
            FROM task_assignments ta
            INNER JOIN tasks t ON ta.task_id = t.id
            INNER JOIN users ub ON ta.assigned_by = ub.id
            INNER JOIN users ut ON ta.assigned_to = ut.id
            LEFT JOIN areas a ON t.area_id = a.id
            WHERE ta.id = :id
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function create(array $data): int
    {
        $sql = "
            INSERT INTO task_assignments (task_id, assigned_by, assigned_to, message, is_read)
            VALUES (:task_id, :assigned_by, :assigned_to, :message, 0)
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':task_id' => $data['task_id'],
            ':assigned_by' => $data['assigned_by'],
            ':assigned_to' => $data['assigned_to'],
            ':message' => $data['message'] ?? null,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function markAsRead(int $id): bool
    {
        $sql = "UPDATE task_assignments SET is_read = 1 WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }

    public function markAllAsRead(int $userId): bool
    {
        $sql = "UPDATE task_assignments SET is_read = 1 WHERE assigned_to = :user_id AND is_read = 0";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':user_id' => $userId]);
    }

    public function countUnread(int $userId): int
    {
        $sql = "SELECT COUNT(*) FROM task_assignments WHERE assigned_to = :user_id AND is_read = 0";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        return (int) $stmt->fetchColumn();
    }

    public function delete(int $id): bool
    {
        $sql = "DELETE FROM task_assignments WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }
}

