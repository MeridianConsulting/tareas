<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\TaskAssignmentService;

class TaskAssignmentController
{
    private $assignmentService;

    public function __construct()
    {
        $this->assignmentService = new TaskAssignmentService();
    }

    // Obtener asignaciones recibidas (para mí)
    public function myAssignments(Request $request)
    {
        $userId = $request->getUserId();
        $filters = [];
        
        if ($request->getQuery('is_read') !== null) {
            $filters['is_read'] = (int)$request->getQuery('is_read');
        }
        
        if ($request->getQuery('limit')) {
            $filters['limit'] = (int)$request->getQuery('limit');
        }

        $assignments = $this->assignmentService->getMyAssignments($userId, $filters);

        return Response::json([
            'data' => $assignments
        ]);
    }

    // Obtener asignaciones enviadas por mí
    public function sentByMe(Request $request)
    {
        $userId = $request->getUserId();
        $filters = [];
        
        if ($request->getQuery('limit')) {
            $filters['limit'] = (int)$request->getQuery('limit');
        }

        $assignments = $this->assignmentService->getAssignmentsSentByMe($userId, $filters);

        return Response::json([
            'data' => $assignments
        ]);
    }

    // Contar no leídas
    public function unreadCount(Request $request)
    {
        $userId = $request->getUserId();
        $count = $this->assignmentService->countUnread($userId);

        return Response::json([
            'data' => ['count' => $count]
        ]);
    }

    // Crear nueva asignación
    public function store(Request $request)
    {
        $body = $request->getBody();
        $userId = $request->getUserId();

        $required = ['task_id', 'assigned_to'];
        foreach ($required as $field) {
            if (empty($body[$field])) {
                return Response::json([
                    'error' => [
                        'code' => 'VALIDATION_ERROR',
                        'message' => "El campo '$field' es requerido"
                    ]
                ], 400);
            }
        }

        try {
            $assignment = $this->assignmentService->create($body, $userId);
            return Response::json([
                'data' => $assignment
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

    // Marcar como leída
    public function markAsRead(Request $request, string $id)
    {
        $userId = $request->getUserId();

        try {
            $this->assignmentService->markAsRead((int)$id, $userId);
            return Response::json([
                'message' => 'Asignación marcada como leída'
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'error' => [
                    'code' => 'UPDATE_ERROR',
                    'message' => $e->getMessage()
                ]
            ], 400);
        }
    }

    // Marcar todas como leídas
    public function markAllAsRead(Request $request)
    {
        $userId = $request->getUserId();
        $this->assignmentService->markAllAsRead($userId);

        return Response::json([
            'message' => 'Todas las asignaciones marcadas como leídas'
        ]);
    }

    // Eliminar asignación
    public function destroy(Request $request, string $id)
    {
        $userId = $request->getUserId();

        try {
            $this->assignmentService->delete((int)$id, $userId);
            return Response::json([
                'message' => 'Asignación eliminada'
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

