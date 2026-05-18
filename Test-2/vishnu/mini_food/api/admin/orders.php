<?php
require_once __DIR__ . '/../utils/functions.php';
require_once __DIR__ . '/../controllers/AdminController.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = trim($_POST['action'] ?? $_GET['action'] ?? '');
$limit  = (int)($_GET['limit'] ?? 100);

$ctrl = new AdminController();
if ($method === 'GET')                              { $ctrl->getOrders(); }
if ($method === 'POST' && $action === 'update_status')   { $ctrl->updateOrderStatus(); }
if ($method === 'POST' && $action === 'update_payment') { $ctrl->updatePaymentStatus(); }
