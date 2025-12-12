<?php

namespace App\Services;

use App\Repositories\TaskRepository;

class TaskService
{
  private $taskRepository;

  public function __construct()
  {
    $this->taskRepository = new TaskRepository();
  }

  public function list(array $filters, array $userContext): array
  {
    return $this->taskRepository->findAll($filters, $userContext);
  }

  public function getById(int $id, array $userContext): ?array
  {
    return $this->taskRepository->findById($id, $userContext);
  }

  public function create(array $data, array $userContext): array
  {
    $data['created_by'] = $userContext['id'];
    $id = $this->taskRepository->create($data);
    return $this->taskRepository->findById($id, $userContext);
  }

  public function update(int $id, array $data, array $userContext): ?array
  {
    // Verificar que existe y tiene permisos
    $task = $this->taskRepository->findById($id, $userContext);
    if (!$task) {
      return null;
    }

    $this->taskRepository->update($id, $data);
    return $this->taskRepository->findById($id, $userContext);
  }

  public function delete(int $id, array $userContext): bool
  {
    // Verificar que existe y tiene permisos
    $task = $this->taskRepository->findById($id, $userContext);
    if (!$task) {
      return false;
    }

    return $this->taskRepository->delete($id);
  }
}

