<?php
require_once __DIR__ . '/../utils/functions.php';
require_once __DIR__ . '/../controllers/AdminController.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = trim($_GET['action'] ?? $_POST['action'] ?? '');

if ($method === 'GET' && $action === 'food') {
    $category_id = (int)($_GET['category_id'] ?? 0);
    if (!$category_id) {
        sendResponse(false, 'Category ID is required.');
    }
}

$ctrl = new AdminController();
if ($method === 'GET' && $action === 'food') {
    $ctrl->getFoodByCategory();
} elseif ($method === 'GET') {
    $ctrl->getSettings();
} elseif ($method === 'POST' && $action === 'cat') {
    $ctrl->toggleCategoryStatus();
} elseif ($method === 'POST' && $action === 'food') {
    $ctrl->toggleFoodStatus();
} elseif ($method === 'POST') {
    $ctrl->updateSettings();
}
