<?php

use App\Controllers\AuthController;
use App\Controllers\TaskController;
use App\Controllers\UserController;
use App\Controllers\AreaController;
use App\Controllers\ReportController;
use App\Controllers\TaskAssignmentController;
use App\Middleware\CorsMiddleware;
use App\Middleware\JwtAuthMiddleware;
use App\Middleware\RoleMiddleware;

return [
  // Global middleware
  'middleware' => [
    CorsMiddleware::class,
  ],

  // Rutas públicas
  'routes' => [
    ['POST', '/api/v1/auth/login', [AuthController::class, 'login']],
    ['POST', '/api/v1/auth/refresh', [AuthController::class, 'refresh']],
  ],

  // Rutas protegidas
  'protected' => [
    'middleware' => [
      JwtAuthMiddleware::class,
    ],
    'routes' => [
      ['GET', '/api/v1/auth/me', [AuthController::class, 'me']],
      ['POST', '/api/v1/auth/logout', [AuthController::class, 'logout']],

      // Tasks
      ['GET', '/api/v1/tasks', [TaskController::class, 'index']],
      ['POST', '/api/v1/tasks', [TaskController::class, 'store']],
      ['GET', '/api/v1/tasks/{id}', [TaskController::class, 'show']],
      ['PUT', '/api/v1/tasks/{id}', [TaskController::class, 'update']],
      ['DELETE', '/api/v1/tasks/{id}', [TaskController::class, 'destroy']],

      // Admin - Areas
      ['GET', '/api/v1/areas', [AreaController::class, 'index']],
      ['POST', '/api/v1/areas', [AreaController::class, 'store'], [RoleMiddleware::class => ['admin']]],
      ['PUT', '/api/v1/areas/{id}', [AreaController::class, 'update'], [RoleMiddleware::class => ['admin']]],
      ['DELETE', '/api/v1/areas/{id}', [AreaController::class, 'destroy'], [RoleMiddleware::class => ['admin']]],

      // Admin - Users
      ['GET', '/api/v1/users', [UserController::class, 'index'], [RoleMiddleware::class => ['admin']]],
      ['POST', '/api/v1/users', [UserController::class, 'store'], [RoleMiddleware::class => ['admin']]],
      ['PUT', '/api/v1/users/{id}', [UserController::class, 'update'], [RoleMiddleware::class => ['admin']]],
      ['DELETE', '/api/v1/users/{id}', [UserController::class, 'destroy'], [RoleMiddleware::class => ['admin']]],

      // Roles (para formularios)
      ['GET', '/api/v1/roles', [UserController::class, 'roles']],

      // Reports
      ['GET', '/api/v1/reports/daily', [ReportController::class, 'daily']],
      ['GET', '/api/v1/reports/management', [ReportController::class, 'management'], [RoleMiddleware::class => ['admin', 'gerencia']]],

      // Task Assignments (cualquier usuario puede asignar)
      ['GET', '/api/v1/assignments/my', [TaskAssignmentController::class, 'myAssignments']],
      ['GET', '/api/v1/assignments/sent', [TaskAssignmentController::class, 'sentByMe']],
      ['GET', '/api/v1/assignments/unread-count', [TaskAssignmentController::class, 'unreadCount']],
      ['POST', '/api/v1/assignments', [TaskAssignmentController::class, 'store']],
      ['PUT', '/api/v1/assignments/{id}/read', [TaskAssignmentController::class, 'markAsRead']],
      ['PUT', '/api/v1/assignments/mark-all-read', [TaskAssignmentController::class, 'markAllAsRead']],
      ['DELETE', '/api/v1/assignments/{id}', [TaskAssignmentController::class, 'destroy']],

      // Users list for assignments (todos pueden ver usuarios para asignar)
      ['GET', '/api/v1/users/list', [UserController::class, 'listAll']],
    ],
  ],
];

