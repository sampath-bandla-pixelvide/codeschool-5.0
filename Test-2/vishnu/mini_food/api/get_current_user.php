<?php
require_once __DIR__ . '/utils/functions.php';
require_once __DIR__ . '/controllers/AuthController.php';

header('Content-Type: application/json');

$token = trim($_SERVER['HTTP_AUTHORIZATION'] ?? '');

if (!$token) {
    sendResponse(false, 'Unauthorized.');
}

$ctrl = new AuthController();
$ctrl->getCurrentUser();
