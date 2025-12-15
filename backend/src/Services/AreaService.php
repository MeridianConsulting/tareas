<?php

namespace App\Services;

use App\Repositories\AreaRepository;

class AreaService
{
  private $areaRepository;

  public function __construct()
  {
    $this->areaRepository = new AreaRepository();
  }

  public function list(): array
  {
    return $this->areaRepository->findAll();
  }

  public function getById(int $id): ?array
  {
    return $this->areaRepository->findById($id);
  }

  public function create(array $data): array
  {
    $id = $this->areaRepository->create($data);
    return $this->areaRepository->findById($id);
  }

  public function update(int $id, array $data): ?array
  {
    $this->areaRepository->update($id, $data);
    return $this->areaRepository->findById($id);
  }

  public function delete(int $id): bool
  {
    // Verificar que el área existe
    $area = $this->areaRepository->findById($id);
    if (!$area) {
      throw new \Exception('Area no encontrada');
    }

    // Verificar si tiene usuarios asociados
    if ($this->areaRepository->hasUsers($id)) {
      throw new \Exception('No se puede eliminar el área porque tiene usuarios asignados');
    }

    // Verificar si tiene tareas asociadas
    if ($this->areaRepository->hasTasks($id)) {
      throw new \Exception('No se puede eliminar el área porque tiene tareas asociadas');
    }

    return $this->areaRepository->delete($id);
  }
}

