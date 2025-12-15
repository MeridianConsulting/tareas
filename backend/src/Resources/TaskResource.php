<?php

namespace App\Resources;

class TaskResource
{
  public static function toArray(array $task): array
  {
    $dueBucket = self::calculateDueBucket($task);

    return [
      'id' => isset($task['id']) ? (int)$task['id'] : 0,
      'area_id' => isset($task['area_id']) ? (int)$task['area_id'] : null,
      'area_name' => $task['area_name'] ?? null,
      'title' => $task['title'] ?? '',
      'description' => $task['description'] ?? null,
      'type' => $task['type'] ?? 'Operativa',
      'priority' => $task['priority'] ?? 'Media',
      'status' => $task['status'] ?? 'No iniciada',
      'progress_percent' => isset($task['progress_percent']) ? (int)$task['progress_percent'] : 0,
      'responsible_id' => isset($task['responsible_id']) ? (int)$task['responsible_id'] : null,
      'responsible_name' => $task['responsible_name'] ?? null,
      'start_date' => $task['start_date'] ?? null,
      'due_date' => $task['due_date'] ?? null,
      'closed_date' => $task['closed_date'] ?? null,
      'due_bucket' => $dueBucket,
      'created_at' => $task['created_at'] ?? null,
      'updated_at' => $task['updated_at'] ?? null,
    ];
  }

  private static function calculateDueBucket(array $task): string
  {
    if ($task['status'] === 'Completada') {
      return 'COMPLETED';
    }

    if (empty($task['due_date'])) {
      return 'NO_DUE_DATE';
    }

    $today = new \DateTime();
    $dueDate = new \DateTime($task['due_date']);
    $diff = $today->diff($dueDate);
    $days = (int)$diff->format('%r%a');

    if ($days < 0) {
      return 'OVERDUE';
    }

    if ($days <= 7) {
      return 'DUE_THIS_WEEK';
    }

    return 'UPCOMING';
  }

  public static function collection(array $tasks): array
  {
    return array_map([self::class, 'toArray'], $tasks);
  }
}

