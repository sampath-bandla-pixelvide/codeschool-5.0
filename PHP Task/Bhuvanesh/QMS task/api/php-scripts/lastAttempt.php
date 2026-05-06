<?php
require_once __DIR__ . '/../controllers/authController.php';

$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    sendResponse(false, "Authorization header missing");
}

$token = str_replace("Bearer ", "", $headers['Authorization']);

$data = new authController();
$data->getLastAttempt($token);