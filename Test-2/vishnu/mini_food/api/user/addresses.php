<?php
require_once __DIR__ . '/../utils/functions.php';
require_once __DIR__ . '/../controllers/UserController.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = trim($_POST['action'] ?? '');

if ($method === 'POST' && !$action) {
    $body       = json_decode(file_get_contents('php://input'), true) ?? [];
    $label      = trim($body['label']      ?? 'Home');
    $address    = trim($body['address']    ?? '');
    $city       = trim($body['city']       ?? '');
    $pincode    = trim($body['pincode']    ?? '');

    if (!$address || !$city || !$pincode) {
        sendResponse(false, 'Address, city and pincode are required.');
    }
}

if ($method === 'POST' && $action === 'delete') {
    $id = (int)($_POST['id'] ?? 0);
    if (!$id) {
        sendResponse(false, 'Invalid address ID.');
    }
}

$ctrl = new UserController();
if ($method === 'GET') {
    $ctrl->getSavedAddresses();
}
if ($method === 'POST' && !$action) {
    $ctrl->saveAddress();
}
if ($method === 'POST' && $action === 'delete') {
    $ctrl->deleteAddress();
}
