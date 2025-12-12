<?php

namespace App\Core;

class Response
{
  private $statusCode = 200;
  private $headers = [];
  private $body;

  public function __construct($body = null, int $statusCode = 200)
  {
    $this->body = $body;
    $this->statusCode = $statusCode;
  }

  public static function json($data, int $statusCode = 200): self
  {
    $response = new self($data, $statusCode);
    $response->header('Content-Type', 'application/json');
    return $response;
  }

  public function header(string $name, string $value): self
  {
    $this->headers[$name] = $value;
    return $this;
  }

  public function status(int $code): self
  {
    $this->statusCode = $code;
    return $this;
  }

  public function getStatusCode(): int
  {
    return $this->statusCode;
  }

  public function send(): void
  {
    http_response_code($this->statusCode);

    foreach ($this->headers as $name => $value) {
      header("$name: $value");
    }

    if ($this->body !== null) {
      echo json_encode($this->body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
  }
}

