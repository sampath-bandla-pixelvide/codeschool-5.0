<?php
require_once __DIR__ . '/../utils/functions.php';
require_once __DIR__ . '/../controllers/UserController.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = trim($_POST['action'] ?? '');

$ctrl = new UserController();
if ($method === 'GET') {
    $ctrl->getProfile();
}
if ($method === 'POST' && $action === 'update') {
    $ctrl->updateProfile();
}
