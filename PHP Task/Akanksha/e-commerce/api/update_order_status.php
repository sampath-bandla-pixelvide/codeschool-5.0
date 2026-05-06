<?php

require_once __DIR__ . "/controllers/ordersController.php";
require_once("./utils/functions.php");

$order_id = $_POST['order_id'] ?? null;
$status = $_POST['status'] ?? null;

if (!$order_id || !$status) {
    sendResponse(false, "Missing data");
    exit;
}

$controller = new ordersController();
$controller->updateStatus($order_id, $status);