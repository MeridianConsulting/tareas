/* 4) Consultas típicas que este modelo soporta bien */

/* Tareas vencidas por área */

SELECT *
FROM tasks
WHERE deleted_at IS NULL
  AND area_id = ?
  AND status <> 'Completada'
  AND due_date IS NOT NULL
  AND due_date < CURDATE();


/* Historial de una tarea */

SELECT e.*, u.name AS user_name
FROM task_events e
JOIN users u ON u.id = e.user_id
WHERE e.task_id = ?
ORDER BY e.created_at ASC;


/* Dashboard gerencial por área (resumen) */

SELECT
  a.id,
  a.name AS area_name,
  COUNT(*) AS total_tasks,
  SUM(t.status = 'Completada') AS completed,
  SUM(t.status = 'En riesgo') AS at_risk,
  SUM(t.status <> 'Completada' AND t.due_date < CURDATE()) AS overdue,
  AVG(t.progress_percent) AS avg_progress
FROM tasks t
JOIN areas a ON a.id = t.area_id
WHERE t.deleted_at IS NULL
GROUP BY a.id, a.name
ORDER BY a.name;