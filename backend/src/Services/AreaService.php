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
}

