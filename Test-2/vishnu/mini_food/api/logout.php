<?php
require_once __DIR__ . '/utils/functions.php';
require_once __DIR__ . '/controllers/AuthController.php';

header('Content-Type: application/json');

$token = trim($_POST['token'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '');

if (!$token) {
    sendResponse(false, 'Token is required.');
}

$ctrl = new AuthController();
$ctrl->logout();
