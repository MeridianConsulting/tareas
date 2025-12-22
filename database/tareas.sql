-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-12-2025 a las 16:58:23
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

--
-- Volcado de datos para la tabla `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`, `created_at`, `ip`, `user_agent`) VALUES
(1, 32, 'e83eab1b6cf584e0466b1f2e903426dd95be406be26c4a45e6c11e97afd8596e', '2026-01-05 10:50:49', '2025-12-22 10:53:00', '2025-12-22 15:50:49', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(2, 32, '7f0b68ccf746d7f0c044cd693ea19889c2b133a3edf48e763fd098444601ceb8', '2026-01-05 10:53:00', '2025-12-22 10:54:40', '2025-12-22 15:53:00', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(3, 32, '6578f58aace1a764621b4c5eaa5a91a82db91c5eb5941d9fced0fa62d920a341', '2026-01-05 10:54:40', NULL, '2025-12-22 15:54:40', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `task_assignments`
--

CREATE TABLE `task_assignments` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `assigned_by` int(11) NOT NULL,
  `assigned_to` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role_id`, `area_id`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 'NORA GISELL MORENO MORENO', 'nmoreno@meridian.com.co', '52030991', 1, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(4, 'WILLIAM AUGUSTO FRANCO CASTELLANOS', 'wfranco@meridian.com.co', '79613401', 1, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(5, 'CESAR AUGUSTO URREGO AVENDAÑO', 'currego@meridian.com.co', '79490148', 1, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(6, 'RUTH MUÑOZ CASTILLO', 'rmunoz@meridian.com.co', '52147279', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(7, 'ZANDRA PATRICIA MAYORGA GOMEZ', 'coordinadoracontable@meridian.com.co', '52005033', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(8, 'GUSTAVO ADOLFO GIRALDO CORREA', 'ggiraldo@meridian.com.co', '1053788938', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(9, 'AURA ALEJANDRA CONTRERAS TORRES', 'asistenteadministrativo1@meridian.com.co', '1014251428', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(10, 'MICHAEL STIVEN RUIZ CARO', 'soportehseqproyectos@meridian.com.co', '1007493802', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(11, 'LUIS MIGUEL GUEVARA MARLES', 'hseq@meridian.com.co', '1119211830', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(12, 'SANDRA MILENA FLOREZ PRADO', 'asistenteadministrativo2@meridian.com.co', '1014180459', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(13, 'ELOY GABRIEL GOMEZ REYES', 'coordinaciongestionhumana@meridian.com.co', '1020733194', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(14, 'DIANA MARCELA JACOBO MANCERA', 'soportehseq@meridian.com.co', '1031145571', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(15, 'LAURA DANIELA SEGURA MORERA', 'profesionalhseq@meridian.com.co', '1121936876', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(16, 'ANDRES CAMILO CARDENAS REYES', 'soporteit.nivel1@meridian.com.co', '1007627524', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(17, 'SONIA STEPHANIA FONSECA LOPEZ', 'asistentegestionhumana2@meridian.com.co', '1007647736', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(18, 'FABRYZCIO ANDRES ORTIZ GARCIA', 'noemail+1102580512@meridian.com.co', '1102580512', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(19, 'EYMER SANTIAGO MENDEZ HERRERA', 'noemail+1031649053@meridian.com.co', '1031649053', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(20, 'ELIANA IVETH ALARCON RONDON', 'proyectos6@meridian.com.co', '1032446831', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(21, 'KAREN JULIETH CARRANZA RODRIGUEZ', 'analistacontable@meridian.com.co', '1000931984', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(22, 'VIVIANA DEL PILAR ALFONSO AVENDAÑO', 'noemail+1022344726@meridian.com.co', '1022344726', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(23, 'KAROL DANIELA SALCEDO ROMERO', 'noemail+1024478397@meridian.com.co', '1024478397', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(24, 'RONALD VASQUEZ ZARATE', 'nominas@meridian.com.co', '79954907', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(25, 'DANIEL ANDRES JOYA SAAVEDRA', 'proyectos2@meridian.com.co', '1136888916', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(26, 'LUISA FERNANDA PACHECO RUBIO', 'asistentegestionhumana@meridian.com.co', '1000588440', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(27, 'MIGUEL LEONARDO MARTINEZ SOTO', 'lidergh@meridian.com.co', '1022347823', 1, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(28, 'DIEGO ALEJANDRO BARRETO HERNANDEZ', 'auxiliarit@meridian.com.co', '1140916030', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(29, 'JORGE ARMANDO PACHECO COLLAZOS', 'asistentelogistica@meridian.com.co', '1010174163', 4, NULL, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(30, 'JESSICA ALEXANDRA ALAVA CHAVEZ', 'noemail+1010222610@meridian.com.co', '1010222610', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(31, 'ANA EBELIA GAMEZ FIGUEREDO', 'contador@meridian.com.co', '39949703', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(32, 'JOSE MATEO LOPEZ CIFUENTES', 'desarrolloit@meridian.com.co', '1011202252', 1, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(33, 'LUISA MARIA MELO RODRÍGUEZ', 'noemail+1018516821@meridian.com.co', '1018516821', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(34, 'LADY LORENA VINCHERY SOLANO', 'noemail+1019136436@meridian.com.co', '1019136436', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(35, 'CRISTIAN ANDRES MURILLO', 'noemail+1033703338@meridian.com.co', '1033703338', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(36, 'DARWIN YAMID GARZON RODRIGUEZ', 'noemail+1070750164@meridian.com.co', '1070750164', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(37, 'PAOLA ADRIANA GIL CHIPATECUA', 'cordinadorproyectos@meridian.com', '52786386', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(38, 'JESSICA ASTRID MAYORGA BARRERA', 'noemail+1026301759@meridian.com.co', '1026301759', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(39, 'JUAN ESTEBAN LOPEZ OSORIO', 'noemail+1089599089@meridian.com.co', '1089599089', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(40, 'JOSHUA ELIAS MENA VARGAS', 'noemail+1091966621@meridian.com.co', '1091966621', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(41, 'LAURA KARINA GAMEZ GOMEZ', 'noemail+1000987240@meridian.com.co', '1000987240', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(42, 'JULIAN ANDRES MORALES SEGURA', 'noemail+1012395152@meridian.com.co', '1012395152', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(43, 'LADY JOHANNA AGUIRRE ROMERO', 'noemail+1024491663@meridian.com.co', '1024491663', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24'),
(44, 'ALISON VANESA GONZALEZ OROZCO', 'noemail+1105465424@meridian.com.co', '1105465424', 4, 2, 1, '2025-12-22 15:43:24', '2025-12-22 15:43:24');

-- --------------------------------------------------------

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
-- Indices de la tabla `task_assignments`
--
ALTER TABLE `task_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_assigned_by` (`assigned_by`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `fk_task_assignments_task` (`task_id`);

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
-- AUTO_INCREMENT de la tabla `task_assignments`
--
ALTER TABLE `task_assignments`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

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
-- Filtros para la tabla `task_assignments`
--
ALTER TABLE `task_assignments`
  ADD CONSTRAINT `fk_task_assignments_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_task_assignments_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_task_assignments_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;

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
