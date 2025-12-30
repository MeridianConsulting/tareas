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
    if (!isset($userContext['id'])) {
      throw new \Exception('User context no válido: falta el ID del usuario');
    }
    
    $data['created_by'] = $userContext['id'];
    
    // Normalizar fechas vacías o inválidas
    if (isset($data['start_date'])) {
      $data['start_date'] = $this->normalizeDate($data['start_date']);
    }
    if (isset($data['due_date'])) {
      $data['due_date'] = $this->normalizeDate($data['due_date']);
    }
    
    try {
      $id = $this->taskRepository->create($data);
      if (!$id || $id <= 0) {
        throw new \Exception('No se pudo crear la tarea: el ID retornado no es válido');
      }
      
      $task = $this->taskRepository->findById($id, $userContext);
      if (!$task) {
        error_log('TaskService::create - Tarea creada con ID ' . $id . ' pero no se pudo recuperar con userContext: ' . json_encode($userContext));
        throw new \Exception('La tarea se creó pero no se pudo recuperar. Verifica los permisos.');
      }
      
      return $task;
    } catch (\PDOException $e) {
      error_log('TaskService::create PDO error: ' . $e->getMessage());
      error_log('Data: ' . json_encode($data));
      throw new \Exception('Error de base de datos: ' . $e->getMessage());
    }
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

