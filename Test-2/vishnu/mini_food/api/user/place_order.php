<?php
require_once __DIR__ . '/../utils/functions.php';
require_once __DIR__ . '/../controllers/UserController.php';

header('Content-Type: application/json');

$body       = json_decode(file_get_contents('php://input'), true) ?? [];
$name       = trim($body['name']        ?? '');
$mobile     = trim($body['mobile']      ?? '');
$address_id = (int)($body['address_id'] ?? 0);
$method     = trim($body['method']      ?? 'cod');
$utr        = trim($body['utr']         ?? '');
$items      = $body['items']            ?? [];

if (!$name || !$mobile) {
    sendResponse(false, 'Name and mobile are required.');
}
if (!$address_id) {
    sendResponse(false, 'Please select a delivery address.');
}
if (empty($items)) {
    sendResponse(false, 'Your cart is empty.');
}

$ctrl = new UserController();
$ctrl->placeOrder();
