<?php
require_once __DIR__ . '/../controllers/authController.php';



if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, "Invalid method");
    exit;
}

$headers = getallheaders();
if (!isset($headers['Authorization'])) return sendResponse(false, "Authorization header missing");
$authHeader = $headers['Authorization'];
if (strpos($authHeader, 'Bearer ') !== 0) return sendResponse(false, "Invalid Authorization format");

$token = substr($authHeader, 7);
$data = new authController();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data->getSubjects($token);
}