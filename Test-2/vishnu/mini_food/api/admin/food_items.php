<?php
require_once __DIR__ . '/../utils/functions.php';
require_once __DIR__ . '/../controllers/AdminController.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = trim($_POST['action'] ?? $_GET['action'] ?? '');

$ctrl = new AdminController();
if ($method === 'GET') {
    $ctrl->getFoodItems();
}
if ($method === 'POST' && !$action) {
    $ctrl->addFoodItem();
}
if ($method === 'POST' && $action === 'update') {
    $ctrl->updateFoodItem();
}
if ($method === 'POST' && $action === 'delete') {
    $ctrl->deleteFoodItem();
}
