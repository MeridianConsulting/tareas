<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\UserService;
use App\Repositories\RoleRepository;
use App\Resources\UserResource;

class UserController
{
  private $userService;
  private $roleRepository;

  public function __construct()
  {
    $this->userService = new UserService();
    $this->roleRepository = new RoleRepository();
  }

  public function index(Request $request)
  {
    $filters = [];
    if ($request->getQuery('is_active') !== null) {
      $filters['is_active'] = (int)$request->getQuery('is_active');
    }

    $users = $this->userService->list($filters);

    return Response::json([
      'data' => UserResource::collection($users)
    ]);
  }

  public function store(Request $request)
  {
    $body = $request->getBody();

    $required = ['name', 'email', 'password', 'role_id'];
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
      $user = $this->userService->create($body);
      return Response::json([
        'data' => UserResource::toArray($user)
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
    $user = $this->userService->update((int)$id, $body);

    if (!$user) {
      return Response::json([
        'error' => [
          'code' => 'NOT_FOUND',
          'message' => 'User not found'
        ]
      ], 404);
    }

    return Response::json([
      'data' => UserResource::toArray($user)
    ]);
  }

  public function roles(Request $request)
  {
    $roles = $this->roleRepository->findAll();
    return Response::json([
      'data' => $roles
    ]);
  }
}

