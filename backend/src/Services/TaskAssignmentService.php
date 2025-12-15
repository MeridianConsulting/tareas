<?php

namespace App\Services;

use App\Repositories\TaskAssignmentRepository;
use App\Repositories\TaskRepository;
use App\Repositories\UserRepository;

class TaskAssignmentService
{
    private $assignmentRepository;
    private $taskRepository;
    private $userRepository;

    public function __construct()
    {
        $this->assignmentRepository = new TaskAssignmentRepository();
        $this->taskRepository = new TaskRepository();
        $this->userRepository = new UserRepository();
    }

    public function getMyAssignments(int $userId, array $filters = []): array
    {
        $filters['assigned_to'] = $userId;
        return $this->assignmentRepository->findAll($filters);
    }

    public function getAssignmentsSentByMe(int $userId, array $filters = []): array
    {
        $filters['assigned_by'] = $userId;
        return $this->assignmentRepository->findAll($filters);
    }

    public function getById(int $id): ?array
    {
        return $this->assignmentRepository->findById($id);
    }

    public function create(array $data, int $assignedBy): array
    {
        // Validar que la tarea existe
        $task = $this->taskRepository->findById($data['task_id']);
        if (!$task) {
            throw new \Exception('La tarea no existe');
        }

        // Validar que el usuario destino existe
        $user = $this->userRepository->findById($data['assigned_to']);
        if (!$user) {
            throw new \Exception('El usuario destino no existe');
        }

        // No permitir asignarse a uno mismo
        if ($data['assigned_to'] == $assignedBy) {
            throw new \Exception('No puedes asignarte una tarea a ti mismo');
        }

        $assignmentData = [
            'task_id' => $data['task_id'],
            'assigned_by' => $assignedBy,
            'assigned_to' => $data['assigned_to'],
            'message' => $data['message'] ?? null,
        ];

        $id = $this->assignmentRepository->create($assignmentData);
        return $this->assignmentRepository->findById($id);
    }

    public function markAsRead(int $id, int $userId): bool
    {
        $assignment = $this->assignmentRepository->findById($id);
        if (!$assignment) {
            throw new \Exception('Asignación no encontrada');
        }

        // Solo el destinatario puede marcar como leída
        if ($assignment['assigned_to'] != $userId) {
            throw new \Exception('No tienes permiso para marcar esta asignación');
        }

        return $this->assignmentRepository->markAsRead($id);
    }

    public function markAllAsRead(int $userId): bool
    {
        return $this->assignmentRepository->markAllAsRead($userId);
    }

    public function countUnread(int $userId): int
    {
        return $this->assignmentRepository->countUnread($userId);
    }

    public function delete(int $id, int $userId): bool
    {
        $assignment = $this->assignmentRepository->findById($id);
        if (!$assignment) {
            throw new \Exception('Asignación no encontrada');
        }

        // Solo quien asignó o el destinatario puede eliminar
        if ($assignment['assigned_by'] != $userId && $assignment['assigned_to'] != $userId) {
            throw new \Exception('No tienes permiso para eliminar esta asignación');
        }

        return $this->assignmentRepository->delete($id);
    }
}

