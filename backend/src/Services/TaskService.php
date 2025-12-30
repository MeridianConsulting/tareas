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

  /**
   * Normalizar fechas: convertir cadenas vacías, "0000-00-00" o valores inválidos a null
   */
  private function normalizeDate($date): ?string
  {
    if (empty($date) || $date === '' || $date === '0000-00-00' || $date === '0000-00-00 00:00:00') {
      return null;
    }
    
    // Validar que sea una fecha válida en formato YYYY-MM-DD
    $d = \DateTime::createFromFormat('Y-m-d', $date);
    if ($d && $d->format('Y-m-d') === $date) {
      return $date;
    }
    
    return null;
  }

  public function create(array $data, array $userContext): array
  {
    $data['created_by'] = $userContext['id'];
    
    // Normalizar fechas vacías o inválidas
    if (isset($data['start_date'])) {
      $data['start_date'] = $this->normalizeDate($data['start_date']);
    }
    if (isset($data['due_date'])) {
      $data['due_date'] = $this->normalizeDate($data['due_date']);
    }
    
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

    // Normalizar fechas vacías o inválidas
    if (isset($data['start_date'])) {
      $data['start_date'] = $this->normalizeDate($data['start_date']);
    }
    if (isset($data['due_date'])) {
      $data['due_date'] = $this->normalizeDate($data['due_date']);
    }
    if (isset($data['closed_date'])) {
      $data['closed_date'] = $this->normalizeDate($data['closed_date']);
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

