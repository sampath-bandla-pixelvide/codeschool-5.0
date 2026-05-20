<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/helpers/ResponseHelper.php';

try {
    require_once __DIR__ . '/routes/api.php';
} catch (Exception $e) {
    ResponseHelper::error($e->getMessage(), 500);
}
