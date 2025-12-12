<?php

namespace App\Resources;

class AreaResource
{
  public static function toArray(array $area): array
  {
    return [
      'id' => (int)$area['id'],
      'name' => $area['name'],
      'code' => $area['code'],
      'type' => $area['type'],
      'parent_id' => $area['parent_id'] ? (int)$area['parent_id'] : null,
      'is_active' => (bool)($area['is_active'] ?? true),
      'created_at' => $area['created_at'] ?? null,
    ];
  }

  public static function collection(array $areas): array
  {
    return array_map([self::class, 'toArray'], $areas);
  }
}

