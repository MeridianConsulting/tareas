<?php

namespace App\Core;

class Request
{
  private $method;
  private $path;
  private $query;
  private $body;
  private $headers;
  private $cookies;
  private $attributes = [];

  private function __construct()
  {
    $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $this->path = $this->parsePath();
    $this->query = $_GET ?? [];
    $this->body = $this->parseBody();
    $this->headers = $this->parseHeaders();
    $this->cookies = $_COOKIE ?? [];
  }

  public static function fromGlobals(): self
  {
    return new self();
  }

  private function parsePath(): string
  {
    $requestUri = $_SERVER['REQUEST_URI'] ?? '/';
    $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
    
    // Extraer solo el path de la URI (sin query string)
    $path = parse_url($requestUri, PHP_URL_PATH);
    
    // Si el path comienza con /api/, mantenerlo tal cual (viene de reescritura .htaccess)
    if (strpos($path, '/api/') === 0) {
      return $path;
    }
    
    // Obtener el directorio base del script
    // Si SCRIPT_NAME es /tareas/backend/public/index.php
    // entonces scriptDir será /tareas/backend/public
    $scriptDir = dirname($scriptName);
    
    // Normalizar paths
    $scriptDir = rtrim($scriptDir, '/');
    $path = rtrim($path, '/');
    
    // Si el path comienza con el scriptDir, eliminarlo
    if ($scriptDir !== '' && $scriptDir !== '/' && strpos($path, $scriptDir) === 0) {
      $path = substr($path, strlen($scriptDir));
    }
    
    // Si el path está vacío, usar /
    if ($path === '') {
      $path = '/';
    }
    
    // Asegurar que empiece con /
    if ($path[0] !== '/') {
      $path = '/' . $path;
    }
    
    return $path;
  }

  private function parseBody(): array
  {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    if (strpos($contentType, 'application/json') !== false) {
      $raw = file_get_contents('php://input');
      $data = json_decode($raw, true);
      return $data ?? [];
    }

    return $_POST ?? [];
  }

  private function parseHeaders(): array
  {
    $headers = [];
    
    // Intentar usar apache_request_headers primero (más confiable para Authorization)
    if (function_exists('apache_request_headers')) {
      $apacheHeaders = apache_request_headers();
      if ($apacheHeaders !== false) {
        foreach ($apacheHeaders as $key => $value) {
          $headers[$key] = $value;
        }
      }
    }
    
    // Complementar con $_SERVER para headers que no estén
    foreach ($_SERVER as $key => $value) {
      if (strpos($key, 'HTTP_') === 0) {
        $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
        if (!isset($headers[$header])) {
          $headers[$header] = $value;
        }
      }
    }
    
    return $headers;
  }

  public function getMethod(): string
  {
    return $this->method;
  }

  public function getPath(): string
  {
    return $this->path;
  }

  public function getQuery(?string $key = null, $default = null)
  {
    if ($key === null) {
      return $this->query;
    }
    return $this->query[$key] ?? $default;
  }

  public function getBody(?string $key = null, $default = null)
  {
    if ($key === null) {
      return $this->body;
    }
    return $this->body[$key] ?? $default;
  }

  public function getHeader(string $key): ?string
  {
    return $this->headers[$key] ?? null;
  }

  public function getCookie(string $key): ?string
  {
    return $this->cookies[$key] ?? null;
  }

  public function getIp(): string
  {
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
  }

  public function getUserAgent(): string
  {
    return $_SERVER['HTTP_USER_AGENT'] ?? '';
  }

  public function setAttribute(string $key, $value): void
  {
    $this->attributes[$key] = $value;
  }

  public function getAttribute(string $key, $default = null)
  {
    return $this->attributes[$key] ?? $default;
  }

  public function getUserId(): ?int
  {
    $userContext = $this->getAttribute('userContext');
    return $userContext['id'] ?? null;
  }

  public function getUser(): ?array
  {
    return $this->getAttribute('userContext');
  }
}

