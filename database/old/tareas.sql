-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-12-2025 a las 14:45:07
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tareas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas`
--

CREATE TABLE `areas` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('AREA','PROYECTO') NOT NULL DEFAULT 'AREA',
  `parent_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `areas`
--

INSERT INTO `areas` (`id`, `name`, `code`, `type`, `parent_id`, `is_active`, `created_at`) VALUES
(1, 'IT', 'IT', 'AREA', NULL, 1, '2025-12-15 13:16:00'),
(2, 'ADMINISTRACIÓN', 'ADMIN', 'AREA', NULL, 1, '2025-12-15 13:16:00'),
(3, 'HSEQ', 'HSEQ', 'AREA', NULL, 1, '2025-12-15 13:16:00'),
(4, 'PROYECTO FRONTERA', 'FRONTERA', 'PROYECTO', NULL, 1, '2025-12-15 13:16:00'),
(5, 'CW', 'CW', 'AREA', NULL, 1, '2025-12-15 13:16:00'),
(6, 'PETROSERVICIOS', 'PETROSERVICIOS', 'AREA', NULL, 1, '2025-12-15 13:16:00'),
(7, 'CONTABILIDAD', 'CONTABILIDAD', 'AREA', NULL, 1, '2025-12-15 13:16:00'),
(8, 'GESTIÓN HUMANA', 'GESTION_HUMANA', 'AREA', NULL, 1, '2025-12-15 13:16:00'),
(9, 'GERENCIA', 'GERENCIA', 'AREA', NULL, 1, '2025-12-15 13:16:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'admin', 'Administrador del sistema'),
(2, 'gerencia', 'Gerencia'),
(3, 'lider_area', 'Líder de área'),
(4, 'colaborador', 'Colaborador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `area_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('Clave','Operativa','Mejora','Obligatoria') NOT NULL DEFAULT 'Operativa',
  `priority` enum('Alta','Media','Baja') NOT NULL DEFAULT 'Media',
  `status` enum('No iniciada','En progreso','En revisión','Completada','En riesgo') NOT NULL DEFAULT 'No iniciada',
  `progress_percent` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `responsible_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `start_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `closed_date` date DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `task_comments`
--

CREATE TABLE `task_comments` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `task_events`
--

CREATE TABLE `task_events` (
  `id` bigint(20) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_type` enum('CREATED','STATUS_CHANGED','RESPONSIBLE_CHANGED','PROGRESS_CHANGED','COMMENT_ADDED','EVIDENCE_ADDED','DUE_DATE_CHANGED','PRIORITY_CHANGED','UPDATED') NOT NULL,
  `meta_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `task_evidences`
--

CREATE TABLE `task_evidences` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `url` varchar(500) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `area_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

--
-- Estructura de tabla para la tabla `user_areas`
--

CREATE TABLE `user_areas` (
  `user_id` int(11) NOT NULL,
  `area_id` int(11) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_areas_parent` (`parent_id`),
  ADD KEY `idx_areas_type` (`type`);

--
-- Indices de la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_refresh_tokens_user` (`user_id`),
  ADD KEY `idx_refresh_tokens_expires` (`expires_at`),
  ADD KEY `idx_refresh_tokens_revoked` (`revoked_at`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tasks_created_by` (`created_by`),
  ADD KEY `idx_tasks_area` (`area_id`),
  ADD KEY `idx_tasks_responsible` (`responsible_id`),
  ADD KEY `idx_tasks_status` (`status`),
  ADD KEY `idx_tasks_due_date` (`due_date`),
  ADD KEY `idx_tasks_updated_at` (`updated_at`),
  ADD KEY `idx_tasks_deleted_at` (`deleted_at`),
  ADD KEY `idx_tasks_area_status_due` (`area_id`,`status`,`due_date`),
  ADD KEY `idx_tasks_responsible_status_due` (`responsible_id`,`status`,`due_date`),
  ADD KEY `idx_tasks_status_due` (`status`,`due_date`),
  ADD KEY `idx_tasks_area_updated` (`area_id`,`updated_at`);

--
-- Indices de la tabla `task_comments`
--
ALTER TABLE `task_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_task_comments_user` (`user_id`),
  ADD KEY `idx_task_comments_task` (`task_id`),
  ADD KEY `idx_task_comments_created` (`created_at`);

--
-- Indices de la tabla `task_events`
--
ALTER TABLE `task_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_task_events_user` (`user_id`),
  ADD KEY `idx_task_events_task` (`task_id`),
  ADD KEY `idx_task_events_created` (`created_at`),
  ADD KEY `idx_task_events_type` (`event_type`);

--
-- Indices de la tabla `task_evidences`
--
ALTER TABLE `task_evidences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_task_evidences_user` (`user_id`),
  ADD KEY `idx_task_evidences_task` (`task_id`),
  ADD KEY `idx_task_evidences_created` (`created_at`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role_id`),
  ADD KEY `idx_users_area` (`area_id`),
  ADD KEY `idx_users_active` (`is_active`);

--
-- Indices de la tabla `user_areas`
--
ALTER TABLE `user_areas`
  ADD PRIMARY KEY (`user_id`,`area_id`),
  ADD KEY `idx_user_areas_area` (`area_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `areas`
--
ALTER TABLE `areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `task_comments`
--
ALTER TABLE `task_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `task_events`
--
ALTER TABLE `task_events`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `task_evidences`
--
ALTER TABLE `task_evidences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `areas`
--
ALTER TABLE `areas`
  ADD CONSTRAINT `fk_areas_parent` FOREIGN KEY (`parent_id`) REFERENCES `areas` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_tasks_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`),
  ADD CONSTRAINT `fk_tasks_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_tasks_responsible` FOREIGN KEY (`responsible_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `task_comments`
--
ALTER TABLE `task_comments`
  ADD CONSTRAINT `fk_task_comments_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_task_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `task_events`
--
ALTER TABLE `task_events`
  ADD CONSTRAINT `fk_task_events_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_task_events_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `task_evidences`
--
ALTER TABLE `task_evidences`
  ADD CONSTRAINT `fk_task_evidences_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_task_evidences_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Filtros para la tabla `user_areas`
--
ALTER TABLE `user_areas`
  ADD CONSTRAINT `fk_user_areas_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_areas_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
