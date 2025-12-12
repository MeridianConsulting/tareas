<?php

require __DIR__ . '/../src/Config/config.php';

use App\Core\Request;
use App\Core\Router;
use App\Core\ExceptionHandler;

// Registrar manejador de excepciones
ExceptionHandler::register();

// Crear request y router
$request = Request::fromGlobals();
$routes = require __DIR__ . '/../src/Config/routes.php';
$router = new Router($routes);

// Dispatch
$response = $router->dispatch($request);
$response->send();

