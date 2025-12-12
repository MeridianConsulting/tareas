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

    $required = ['name', 'code'];
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
}

