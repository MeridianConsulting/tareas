<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\TaskService;
use App\Resources\TaskResource;

class TaskController
{
  private $taskService;

  public function __construct()
  {
    $this->taskService = new TaskService();
  }

  public function index(Request $request)
  {
    try {
      $userContext = $request->getAttribute('userContext');
      
      if (!$userContext) {
        return Response::json([
          'error' => [
            'code' => 'UNAUTHORIZED',
            'message' => 'User context not found'
          ]
        ], 401);
      }
      
      $filters = [
        'status' => $request->getQuery('status'),
        'priority' => $request->getQuery('priority'),
        'type' => $request->getQuery('type'),
        'area_id' => $request->getQuery('area_id') ? (int)$request->getQuery('area_id') : null,
        'responsible_id' => $request->getQuery('responsible_id') ? (int)$request->getQuery('responsible_id') : null,
        'date_from' => $request->getQuery('date_from'),
        'date_to' => $request->getQuery('date_to'),
        'due_from' => $request->getQuery('due_from'),
        'due_to' => $request->getQuery('due_to'),
      ];

      // Eliminar filtros vacíos
      $filters = array_filter($filters, function($value) {
        return $value !== null && $value !== '';
      });

      $tasks = $this->taskService->list($filters, $userContext);

      return Response::json([
        'data' => TaskResource::collection($tasks)
      ]);
    } catch (\Exception $e) {
      error_log('TaskController::index error: ' . $e->getMessage());
      error_log('Stack trace: ' . $e->getTraceAsString());
      
      return Response::json([
        'error' => [
          'code' => 'INTERNAL_ERROR',
          'message' => APP_DEBUG ? $e->getMessage() : 'Internal server error',
          'details' => APP_DEBUG ? [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
          ] : null
        ]
      ], 500);
    }
  }

  public function show(Request $request, string $id)
  {
    $userContext = $request->getAttribute('userContext');
    $task = $this->taskService->getById((int)$id, $userContext);

    if (!$task) {
      return Response::json([
        'error' => [
          'code' => 'NOT_FOUND',
          'message' => 'Task not found'
        ]
      ], 404);
    }

    return Response::json([
      'data' => TaskResource::toArray($task)
    ]);
  }

  public function store(Request $request)
  {
    $userContext = $request->getAttribute('userContext');
    $body = $request->getBody();

    $required = ['title', 'area_id', 'responsible_id'];
    foreach ($required as $field) {
      if (empty($body[$field])) {
        return Response::json([
          'error' => [
            'code' => 'VALIDATION_ERROR',
            'message' => "Field '$field' is required"
          ]
        ], 400);
      }
    }

    try {
      $task = $this->taskService->create($body, $userContext);
      return Response::json([
        'data' => TaskResource::toArray($task)
      ], 201);
    } catch (\Exception $e) {
      return Response::json([
        'error' => [
          'code' => 'CREATE_ERROR',
          'message' => $e->getMessage()
        ]
      ], 400);
    }
  }

  public function update(Request $request, string $id)
  {
    $userContext = $request->getAttribute('userContext');
    $body = $request->getBody();

    $task = $this->taskService->update((int)$id, $body, $userContext);

    if (!$task) {
      return Response::json([
        'error' => [
          'code' => 'NOT_FOUND',
          'message' => 'Task not found or insufficient permissions'
        ]
      ], 404);
    }

    return Response::json([
      'data' => TaskResource::toArray($task)
    ]);
  }

  public function destroy(Request $request, string $id)
  {
    $userContext = $request->getAttribute('userContext');
    $deleted = $this->taskService->delete((int)$id, $userContext);

    if (!$deleted) {
      return Response::json([
        'error' => [
          'code' => 'NOT_FOUND',
          'message' => 'Task not found or insufficient permissions'
        ]
      ], 404);
    }

    return Response::json([
      'data' => ['message' => 'Task deleted successfully']
    ]);
  }
}

