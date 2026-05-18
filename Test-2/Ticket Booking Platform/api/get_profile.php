<?php
require_once __DIR__ . "/controllers/authControllers.php";
$headers = apache_request_headers();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
if (!$token) {
    require_once __DIR__ . "/utils/functions.php";
    sendResponse(false, "Unauthorized access");
}
$auth = new AuthController();
$auth->getProfile($token);
