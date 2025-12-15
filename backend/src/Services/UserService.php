<?php

namespace App\Services;

use App\Repositories\UserRepository;

class UserService
{
  private $userRepository;

  public function __construct()
  {
    $this->userRepository = new UserRepository();
  }

  public function list(array $filters = []): array
  {
    return $this->userRepository->findAll($filters);
  }

  public function getById(int $id): ?array
  {
    return $this->userRepository->findById($id);
  }

  public function create(array $data): array
  {
    if (isset($data['password'])) {
      $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
      unset($data['password']);
    }

    $id = $this->userRepository->create($data);
    return $this->userRepository->findById($id);
  }

  public function update(int $id, array $data): ?array
  {
    if (isset($data['password']) && !empty($data['password'])) {
      $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
      unset($data['password']);
    }

    $this->userRepository->update($id, $data);
    return $this->userRepository->findById($id);
  }

  public function delete(int $id): bool
  {
    // Verificar que el usuario existe
    $user = $this->userRepository->findById($id);
    if (!$user) {
      throw new \Exception('Usuario no encontrado');
    }

    // Verificar si tiene tareas asociadas
    if ($this->userRepository->hasTasks($id)) {
      throw new \Exception('No se puede eliminar el usuario porque tiene tareas asociadas');
    }

    return $this->userRepository->delete($id);
  }
}

