<?php

namespace App\Resources;

class UserResource
{
  public static function toArray(array $user): array
  {
    return [
      'id' => (int)$user['id'],
      'name' => $user['name'],
      'email' => $user['email'],
      'role' => $user['role_name'] ?? null,
      'role_id' => (int)($user['role_id'] ?? 0),
      'area_id' => $user['area_id'] ? (int)$user['area_id'] : null,
      'area_name' => $user['area_name'] ?? null,
      'is_active' => (bool)($user['is_active'] ?? true),
      'created_at' => $user['created_at'] ?? null,
    ];
  }

  public static function collection(array $users): array
  {
    return array_map([self::class, 'toArray'], $users);
  }
}

