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
    $path = $_SERVER['REQUEST_URI'] ?? '/';
    $path = parse_url($path, PHP_URL_PATH);
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
    foreach ($_SERVER as $key => $value) {
      if (strpos($key, 'HTTP_') === 0) {
        $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
        $headers[$header] = $value;
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
}

