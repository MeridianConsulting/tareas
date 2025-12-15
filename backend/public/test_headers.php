<?php
header('Content-Type: application/json');
$relevantHeaders = [];
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'AUTH') !== false || strpos($key, 'HTTP') !== false) {
        $relevantHeaders[$key] = $value;
    }
}
echo json_encode([
    'SERVER' => $relevantHeaders,
    'apache_request_headers' => function_exists('apache_request_headers') ? apache_request_headers() : 'not available'
], JSON_PRETTY_PRINT);
