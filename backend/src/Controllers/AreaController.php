<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AreaService;
use App\Resources\AreaResource;

class AreaController
{
  private $areaService;

  public function __construct()
  {
    $this->areaService = new AreaService();
  }

  public function index(Request $request)
  {
    $areas = $this->areaService->list();

    return Response::json([
      'data' => AreaResource::collection($areas)
    ]);
  }

  public function store(Request $request)
  {
    $body = $request->getBody();

    // Validar datos
    $errors = \App\Services\ValidationService::validateAreaData($body);
    if (!empty($errors)) {
      return Response::json([
        'error' => [
          'code' => 'VALIDATION_ERROR',
          'message' => 'Validation failed',
          'errors' => $errors
        ]
      ], 400);
    }

    try {
      $area = $this->areaService->create($body);
      return Response::json([
        'data' => AreaResource::toArray($area)
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
    $body = $request->getBody();
    
    // Validar datos
    $errors = \App\Services\ValidationService::validateAreaData($body);
    if (!empty($errors)) {
      return Response::json([
        'error' => [
          'code' => 'VALIDATION_ERROR',
          'message' => 'Validation failed',
          'errors' => $errors
        ]
      ], 400);
    }
    
    $area = $this->areaService->update((int)$id, $body);

    if (!$area) {
      return Response::json([
        'error' => [
          'code' => 'NOT_FOUND',
          'message' => 'Area not found'
        ]
      ], 404);
    }

    return Response::json([
      'data' => AreaResource::toArray($area)
    ]);
  }

  public function destroy(Request $request, string $id)
  {
    try {
      $this->areaService->delete((int)$id);
      return Response::json([
        'message' => 'Area eliminada correctamente'
      ]);
    } catch (\Exception $e) {
      return Response::json([
        'error' => [
          'code' => 'DELETE_ERROR',
          'message' => $e->getMessage()
        ]
      ], 400);
    }
  }
}

