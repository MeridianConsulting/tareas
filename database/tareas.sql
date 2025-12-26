-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-12-2025 a las 16:24:56
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
-- Estructura de tabla para la tabla `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` bigint(20) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `success` tinyint(1) NOT NULL DEFAULT 0,
  `user_agent` varchar(255) DEFAULT NULL,
  `attempted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_otps`
--

CREATE TABLE `password_reset_otps` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `otp_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `attempts` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_ip` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `password_reset_otps`
--

INSERT INTO `password_reset_otps` (`id`, `user_id`, `otp_hash`, `expires_at`, `used_at`, `attempts`, `created_ip`, `user_agent`, `created_at`) VALUES
(1, 32, 'c70720248b790f5973ad3f8940ab3715a8ca84305c9db9e0588a8bf99deb8f67', '2025-12-22 12:57:28', '2025-12-22 12:48:42', 0, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 12:47:28'),
(2, 32, 'f5a271cff0b27c304cb52592ecac96d98a44186e8e7a1d447cc4ec955418c3b6', '2025-12-22 12:58:42', '2025-12-22 12:53:01', 0, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 12:48:42'),
(3, 32, '745b103c288911c11d84572a64fba3aa6d95c5d8587845a6b6c9edf91bcc6790', '2025-12-22 13:03:01', NULL, 0, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 12:53:01'),
(4, 32, '0d53642902b51938b68cf3c72ac66ef35ed18b5a109dd83820e53c725f627153', '2025-12-22 14:36:48', NULL, 0, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 14:26:48'),
(5, 32, 'd9071055301b0131364a45479b1c72000c1369a4eee0c07c63d91ff9b3eb8a6b', '2025-12-22 15:02:08', '2025-12-22 14:52:31', 0, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 14:52:08'),
(6, 32, 'fd39a211eaca466432ded61b4148e42ede9fae49c44249c9ff4fec3cadd0e5d1', '2025-12-22 15:03:39', '2025-12-22 14:53:52', 0, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 14:53:39'),
(7, 32, '6e286972f8f0453eb35e48a0601379c6101aaf3b10cbbd8e4bbec585f749dcc2', '2025-12-22 15:09:07', '2025-12-22 14:59:24', 0, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 14:59:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `used_at`, `created_at`) VALUES
(1, 32, '0d930c8dd2caefe896d75fa95c1df15405fffebe1656eae4da15d448719033d5', '2025-12-22 15:07:31', '2025-12-22 14:52:49', '2025-12-22 14:52:31'),
(2, 32, '3c8fa1e1629b89dbd8b115d1d42574cd17d99df4131ca47de5a20e7d182c1aeb', '2025-12-22 15:08:52', '2025-12-22 14:54:03', '2025-12-22 14:53:52'),
(3, 32, 'eabd36bc6e306b23dfa93bdf1458b3d85ab5e176c23007c9548d6d1fb0aefa9a', '2025-12-22 15:14:24', '2025-12-22 14:59:43', '2025-12-22 14:59:24');

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
(3, 32, '6578f58aace1a764621b4c5eaa5a91a82db91c5eb5941d9fced0fa62d920a341', '2026-01-05 10:54:40', '2025-12-22 11:09:57', '2025-12-22 15:54:40', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(4, 32, 'f4cde21846fa7c7b282891ceacec86f2539fcb9f32d9ed77d574e1a5c7684ad2', '2026-01-05 11:09:57', '2025-12-22 11:25:03', '2025-12-22 16:09:57', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(5, 32, '87ad5fccc727f7e337395dd60d7dd8c7b63724c5fbf4362bad5987f6ebcbc33b', '2026-01-05 11:25:03', '2025-12-22 11:40:03', '2025-12-22 16:25:03', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(6, 32, 'e2965afe16459ab8776d2b83effaf365fd1810f70e6f0bddfbfa9a65e1434e46', '2026-01-05 11:40:03', '2025-12-22 11:55:33', '2025-12-22 16:40:03', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(7, 32, 'b5c5edebf61ba362f44adffc6bea7b308d14a4b9ffa7949533cee06c51a2b7c7', '2026-01-05 11:55:33', '2025-12-22 12:11:02', '2025-12-22 16:55:33', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(8, 32, '83c2ce9651b3becfd15334e573420a07d5c9bbc4a1b977c24543376cc1aa9c3f', '2026-01-05 12:11:02', NULL, '2025-12-22 17:11:02', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(9, 32, 'dce4c95c8ba7581ef0744b60b58024f35065e8374e0db18d406bb0474a886cd3', '2026-01-05 12:20:08', NULL, '2025-12-22 17:20:08', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(10, 32, '6b4137d836f7501a6b3c562dda72126eaabf82164125e331528579627bcde5c3', '2026-01-05 12:20:29', '2025-12-22 12:20:38', '2025-12-22 17:20:29', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(11, 32, '64824471b9af731d1982d824b69e4189e7f3121ab008fa2fea4918c742a626ab', '2026-01-05 12:20:38', '2025-12-22 12:20:38', '2025-12-22 17:20:38', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(12, 32, '64824471b9af731d1982d824b69e4189e7f3121ab008fa2fea4918c742a626ab', '2026-01-05 12:20:38', NULL, '2025-12-22 17:20:38', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(13, 32, '8cc33fc422af09785f5ee47aa5d31a6adef729bc88ffb4ced4fee8271846a96d', '2026-01-05 14:53:03', NULL, '2025-12-22 19:53:03', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(14, 32, 'e205a2bd1a9fd9427885223a99c89a143edeb378366d3c6b3cd855aad7d0f23f', '2026-01-05 14:54:20', NULL, '2025-12-22 19:54:20', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(15, 32, '92a308bc9a2e41b116fb8056723c0366a93b23b57b9b5807b22abb07d41a5cdc', '2026-01-05 15:01:09', '2025-12-22 15:17:01', '2025-12-22 20:01:09', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(16, 32, '2d81047c6c82992e29204df66722274cfc9517aa6c9ee4d4ead5784570367d0d', '2026-01-05 15:17:01', '2025-12-22 15:32:01', '2025-12-22 20:17:01', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(17, 32, '78203ffe653fbaf8572b274e8fbc9773da4908834bae2d3692add77a1bf89115', '2026-01-05 15:32:01', '2025-12-22 15:47:01', '2025-12-22 20:32:01', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(18, 32, '53797f1c3e4d0b80c6e3722370eb1efb3411865bf6f504ac41e8bed0959ace21', '2026-01-05 15:47:01', '2025-12-22 16:02:01', '2025-12-22 20:47:01', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(19, 32, '54380eeb9075262565c88a0c092181e833c9a76761c338bc13f553610fb951e9', '2026-01-05 16:02:01', '2025-12-22 16:17:11', '2025-12-22 21:02:01', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(20, 32, '9f64f27db53c31b57b1513e25972521ecc15202d91ea944faf124af4d8547ca2', '2026-01-05 16:17:11', '2025-12-22 16:32:11', '2025-12-22 21:17:11', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(21, 32, '9914f6ee1f94e38e900af77631dab6b95782fee27f63994c0a032d67354d099d', '2026-01-05 16:32:11', '2025-12-26 08:13:51', '2025-12-22 21:32:11', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(22, 32, 'a77c64f12585eb23a7657441c09d17b9772e7075fb3f7a48ba7737d0f178d845', '2026-01-09 08:13:51', '2025-12-26 08:29:01', '2025-12-26 13:13:51', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(23, 32, '57d565d67cf7dc1aa55ca372995b680bbb1500f1fc451de371b3dd0498df5e69', '2026-01-09 08:29:01', NULL, '2025-12-26 13:29:01', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(24, 32, '9cd5b265e211f6e1fc20a71cbdebd69dadb4ef52dcfc089e755e5d96e0f97342', '2026-01-09 08:51:25', '2025-12-26 09:10:33', '2025-12-26 13:51:25', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(25, 32, 'a1bb66c6df57a4133c2c4321e1ccd2fa3076bae8d60d3d0e040466e8bba61bdc', '2026-01-09 09:10:33', '2025-12-26 09:25:46', '2025-12-26 14:10:33', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(26, 32, 'a1bb66c6df57a4133c2c4321e1ccd2fa3076bae8d60d3d0e040466e8bba61bdc', '2026-01-09 09:10:33', '2025-12-26 09:25:46', '2025-12-26 14:10:33', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(27, 32, '7a1087d9c4f25558738ccac9f2f1f81fb3bcd5753f9cb20299055f191b4746d1', '2026-01-09 09:25:46', '2025-12-26 09:40:59', '2025-12-26 14:25:46', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
(28, 32, 'fa54d5fcfd56806aa311e50cc35e6698f60ca4fc92db878441a8ac144a964623', '2026-01-09 09:40:59', NULL, '2025-12-26 14:40:59', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36');

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
(2, 'lider_area', 'Líder de área'),
(3, 'colaborador', 'Colaborador');

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
(4, 'WILLIAM AUGUSTO FRANCO CASTELLANOS', 'wfranco@meridian.com.co', '79613401', 1, 9, 1, '2025-12-22 15:43:24', '2025-12-26 14:15:09'),
(5, 'CESAR AUGUSTO URREGO AVENDAÑO', 'currego@meridian.com.co', '79490148', 1, 9, 1, '2025-12-22 15:43:24', '2025-12-26 14:15:12'),
(6, 'RUTH MUÑOZ CASTILLO', 'rmunoz@meridian.com.co', '52147279', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-26 13:47:15'),
(7, 'ZANDRA PATRICIA MAYORGA GOMEZ', 'coordinadoracontable@meridian.com.co', '52005033', 3, 7, 1, '2025-12-22 15:43:24', '2025-12-26 14:15:28'),
(8, 'GUSTAVO ADOLFO GIRALDO CORREA', 'ggiraldo@meridian.com.co', '1053788938', 2, 4, 1, '2025-12-22 15:43:24', '2025-12-26 14:15:37'),
(9, 'AURA ALEJANDRA CONTRERAS TORRES', 'asistenteadministrativo1@meridian.com.co', '1014251428', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-26 13:47:15'),
(10, 'MICHAEL STIVEN RUIZ CARO', 'soportehseqproyectos@meridian.com.co', '1007493802', 3, 3, 1, '2025-12-22 15:43:24', '2025-12-26 14:15:46'),
(11, 'LUIS MIGUEL GUEVARA MARLES', 'hseq@meridian.com.co', '1119211830', 2, 3, 1, '2025-12-22 15:43:24', '2025-12-26 14:15:49'),
(12, 'SANDRA MILENA FLOREZ PRADO', 'asistenteadministrativo2@meridian.com.co', '1014180459', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-26 13:47:15'),
(13, 'ELOY GABRIEL GOMEZ REYES', 'coordinaciongestionhumana@meridian.com.co', '1020733194', 3, 8, 1, '2025-12-22 15:43:24', '2025-12-26 14:15:59'),
(14, 'DIANA MARCELA JACOBO MANCERA', 'soportehseq@meridian.com.co', '1031145571', 3, 3, 1, '2025-12-22 15:43:24', '2025-12-26 14:16:05'),
(15, 'LAURA DANIELA SEGURA MORERA', 'profesionalhseq@meridian.com.co', '1121936876', 3, 3, 1, '2025-12-22 15:43:24', '2025-12-26 14:16:10'),
(16, 'ANDRES CAMILO CARDENAS REYES', 'soporteit.nivel1@meridian.com.co', '1007627524', 3, 1, 1, '2025-12-22 15:43:24', '2025-12-26 14:16:15'),
(17, 'SONIA STEPHANIA FONSECA LOPEZ', 'asistentegestionhumana2@meridian.com.co', '1007647736', 3, 8, 1, '2025-12-22 15:43:24', '2025-12-26 14:16:19'),
(18, 'FABRYZCIO ANDRES ORTIZ GARCIA', 'noemail+1102580512@meridian.com.co', '1102580512', 3, 4, 1, '2025-12-22 15:43:24', '2025-12-26 14:16:28'),
(19, 'EYMER SANTIAGO MENDEZ HERRERA', 'noemail+1031649053@meridian.com.co', '1031649053', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-26 13:47:15'),
(20, 'ELIANA IVETH ALARCON RONDON', 'proyectos6@meridian.com.co', '1032446831', 2, 6, 1, '2025-12-22 15:43:24', '2025-12-26 14:16:45'),
(21, 'KAREN JULIETH CARRANZA RODRIGUEZ', 'analistacontable@meridian.com.co', '1000931984', 3, 7, 1, '2025-12-22 15:43:24', '2025-12-26 14:16:52'),
(22, 'VIVIANA DEL PILAR ALFONSO AVENDAÑO', 'noemail+1022344726@meridian.com.co', '1022344726', 3, 5, 1, '2025-12-22 15:43:24', '2025-12-26 14:17:14'),
(23, 'KAROL DANIELA SALCEDO ROMERO', 'noemail+1024478397@meridian.com.co', '1024478397', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-26 13:47:15'),
(24, 'RONALD VASQUEZ ZARATE', 'nominas@meridian.com.co', '79954907', 3, 7, 1, '2025-12-22 15:43:24', '2025-12-26 14:17:24'),
(25, 'DANIEL ANDRES JOYA SAAVEDRA', 'proyectos2@meridian.com.co', '1136888916', 3, 4, 1, '2025-12-22 15:43:24', '2025-12-26 14:17:29'),
(26, 'LUISA FERNANDA PACHECO RUBIO', 'asistentegestionhumana@meridian.com.co', '1000588440', 3, 8, 1, '2025-12-22 15:43:24', '2025-12-26 14:17:35'),
(27, 'MIGUEL LEONARDO MARTINEZ SOTO', 'lidergh@meridian.com.co', '1022347823', 1, 8, 1, '2025-12-22 15:43:24', '2025-12-26 14:17:40'),
(28, 'DIEGO ALEJANDRO BARRETO HERNANDEZ', 'auxiliarit@meridian.com.co', '1140916030', 3, 1, 1, '2025-12-22 15:43:24', '2025-12-26 14:17:44'),
(29, 'JORGE ARMANDO PACHECO COLLAZOS', 'asistentelogistica@meridian.com.co', '1010174163', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-26 14:14:43'),
(30, 'JESSICA ALEXANDRA ALAVA CHAVEZ', 'noemail+1010222610@meridian.com.co', '1010222610', 3, 7, 1, '2025-12-22 15:43:24', '2025-12-26 14:19:32'),
(31, 'ANA EBELIA GAMEZ FIGUEREDO', 'contador@meridian.com.co', '39949703', 2, 2, 1, '2025-12-22 15:43:24', '2025-12-26 14:18:06'),
(32, 'JOSE MATEO LOPEZ CIFUENTES', 'desarrolloit@meridian.com.co', '$argon2id$v=19$m=65536,t=4,p=1$TlVmTHMuOXR2Mkd2dEJLdg$vINBmjTupl56XOVAwIe8pDot015Ip3PaN1XXTV58r9A', 1, 1, 1, '2025-12-22 15:43:24', '2025-12-26 14:18:13'),
(33, 'LUISA MARIA MELO RODRÍGUEZ', 'noemail+1018516821@meridian.com.co', '1018516821', 3, 7, 1, '2025-12-22 15:43:24', '2025-12-26 14:18:22'),
(34, 'LADY LORENA VINCHERY SOLANO', 'noemail+1019136436@meridian.com.co', '1019136436', 3, 8, 1, '2025-12-22 15:43:24', '2025-12-26 14:18:29'),
(35, 'CRISTIAN ANDRES MURILLO', 'noemail+1033703338@meridian.com.co', '1033703338', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-26 13:47:15'),
(36, 'DARWIN YAMID GARZON RODRIGUEZ', 'noemail+1070750164@meridian.com.co', '1070750164', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-26 13:47:15'),
(37, 'PAOLA ADRIANA GIL CHIPATECUA', 'cordinadorproyectos@meridian.com', '52786386', 2, 5, 1, '2025-12-22 15:43:24', '2025-12-26 14:18:44'),
(38, 'JESSICA ASTRID MAYORGA BARRERA', 'noemail+1026301759@meridian.com.co', '1026301759', 3, 5, 1, '2025-12-22 15:43:24', '2025-12-26 14:19:09'),
(39, 'JUAN ESTEBAN LOPEZ OSORIO', 'noemail+1089599089@meridian.com.co', '1089599089', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-26 13:47:15'),
(40, 'JOSHUA ELIAS MENA VARGAS', 'noemail+1091966621@meridian.com.co', '1091966621', 3, 3, 1, '2025-12-22 15:43:24', '2025-12-26 14:19:49'),
(41, 'LAURA KARINA GAMEZ GOMEZ', 'noemail+1000987240@meridian.com.co', '1000987240', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-26 13:47:15'),
(42, 'JULIAN ANDRES MORALES SEGURA', 'noemail+1012395152@meridian.com.co', '1012395152', 3, 7, 1, '2025-12-22 15:43:24', '2025-12-26 14:21:27'),
(43, 'LADY JOHANNA AGUIRRE ROMERO', 'noemail+1024491663@meridian.com.co', '1024491663', 3, 7, 1, '2025-12-22 15:43:24', '2025-12-26 14:21:34'),
(44, 'ALISON VANESA GONZALEZ OROZCO', 'noemail+1105465424@meridian.com.co', '1105465424', 3, 2, 1, '2025-12-22 15:43:24', '2025-12-26 13:47:15');

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
-- Indices de la tabla `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ip_attempted` (`ip_address`,`attempted_at`),
  ADD KEY `idx_attempted_at` (`attempted_at`);

--
-- Indices de la tabla `password_reset_otps`
--
ALTER TABLE `password_reset_otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_active` (`user_id`,`used_at`,`expires_at`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `idx_user_active` (`user_id`,`used_at`,`expires_at`);

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
-- AUTO_INCREMENT de la tabla `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `password_reset_otps`
--
ALTER TABLE `password_reset_otps`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

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
-- Filtros para la tabla `password_reset_otps`
--
ALTER TABLE `password_reset_otps`
  ADD CONSTRAINT `fk_pro_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `fk_prt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
