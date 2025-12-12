-- Recomendado
SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =========================
-- 1) Roles
-- =========================
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,      -- admin, gerencia, lider_area, colaborador
  description VARCHAR(255) NULL
) ENGINE=InnoDB;

-- =========================
-- 2) Áreas / Proyectos
-- =========================
CREATE TABLE areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('AREA','PROYECTO') NOT NULL DEFAULT 'AREA',
  parent_id INT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_areas_parent
    FOREIGN KEY (parent_id) REFERENCES areas(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_areas_parent ON areas(parent_id);
CREATE INDEX idx_areas_type ON areas(type);

-- =========================
-- 3) Usuarios
-- =========================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  area_id INT NULL,                      -- área principal
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_users_area
    FOREIGN KEY (area_id) REFERENCES areas(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_area ON users(area_id);
CREATE INDEX idx_users_active ON users(is_active);

-- =========================
-- 4) (Opcional) Usuarios en múltiples áreas/proyectos
-- =========================
CREATE TABLE user_areas (
  user_id INT NOT NULL,
  area_id INT NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, area_id),
  CONSTRAINT fk_user_areas_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_areas_area
    FOREIGN KEY (area_id) REFERENCES areas(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_user_areas_area ON user_areas(area_id);

-- =========================
-- 5) Tareas
-- =========================
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  area_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  type ENUM('Clave','Operativa','Mejora','Obligatoria') NOT NULL DEFAULT 'Operativa',
  priority ENUM('Alta','Media','Baja') NOT NULL DEFAULT 'Media',
  status ENUM('No iniciada','En progreso','En revisión','Completada','En riesgo')
         NOT NULL DEFAULT 'No iniciada',
  progress_percent TINYINT UNSIGNED NOT NULL DEFAULT 0,
  responsible_id INT NOT NULL,
  created_by INT NOT NULL,
  start_date DATE NULL,
  due_date DATE NULL,
  closed_date DATE NULL,

  -- Soft delete (recomendado si necesitas “histórico” sin borrar)
  deleted_at DATETIME NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT chk_tasks_progress CHECK (progress_percent BETWEEN 0 AND 100),

  CONSTRAINT fk_tasks_area
    FOREIGN KEY (area_id) REFERENCES areas(id),
  CONSTRAINT fk_tasks_responsible
    FOREIGN KEY (responsible_id) REFERENCES users(id),
  CONSTRAINT fk_tasks_created_by
    FOREIGN KEY (created_by) REFERENCES users(id),

  -- Si quieres forzar coherencia:
  CONSTRAINT chk_tasks_closed_date
    CHECK (closed_date IS NULL OR status = 'Completada')
) ENGINE=InnoDB;

-- Índices operativos + reportes
CREATE INDEX idx_tasks_area ON tasks(area_id);
CREATE INDEX idx_tasks_responsible ON tasks(responsible_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);

-- Índices compuestos recomendados para dashboards
CREATE INDEX idx_tasks_area_status_due ON tasks(area_id, status, due_date);
CREATE INDEX idx_tasks_responsible_status_due ON tasks(responsible_id, status, due_date);
CREATE INDEX idx_tasks_status_due ON tasks(status, due_date);
CREATE INDEX idx_tasks_area_updated ON tasks(area_id, updated_at);

-- =========================
-- 6) Comentarios
-- =========================
CREATE TABLE task_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_comments_task
    FOREIGN KEY (task_id) REFERENCES tasks(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_task_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_task_comments_task ON task_comments(task_id);
CREATE INDEX idx_task_comments_created ON task_comments(created_at);

-- =========================
-- 7) Evidencias (links/archivos externos)
-- =========================
CREATE TABLE task_evidences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_evidences_task
    FOREIGN KEY (task_id) REFERENCES tasks(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_task_evidences_user
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_task_evidences_task ON task_evidences(task_id);
CREATE INDEX idx_task_evidences_created ON task_evidences(created_at);

-- =========================
-- 8) Auditoría / Historial de cambios (tarea)
-- =========================
CREATE TABLE task_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  event_type ENUM(
    'CREATED',
    'STATUS_CHANGED',
    'RESPONSIBLE_CHANGED',
    'PROGRESS_CHANGED',
    'COMMENT_ADDED',
    'EVIDENCE_ADDED',
    'DUE_DATE_CHANGED',
    'PRIORITY_CHANGED',
    'UPDATED'
  ) NOT NULL,
  meta_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_events_task
    FOREIGN KEY (task_id) REFERENCES tasks(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_task_events_user
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_task_events_task ON task_events(task_id);
CREATE INDEX idx_task_events_created ON task_events(created_at);
CREATE INDEX idx_task_events_type ON task_events(event_type);

-- =========================
-- 9) Refresh tokens
-- =========================
CREATE TABLE refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_revoked ON refresh_tokens(revoked_at);
