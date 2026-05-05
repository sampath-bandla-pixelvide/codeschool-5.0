<?php

require_once __DIR__ . "/controllers/ordersController.php";

require_once("./utils/functions.php");

$user_id = $_POST['user_id'] ?? null;
$items = $_POST['items'] ?? null;
$address_id = $_POST['address_id'] ?? null;
$payment_method = $_POST['payment_method'] ?? null;


if (!$user_id || !$items || !$address_id || !$payment_method) {
    sendResponse(false, "Missing required fields");
    exit;
}

$items = json_decode($items, true);

if (!$items || count($items) === 0) {
    sendResponse(false, "Cart is empty");
    exit;
}


$controller = new ordersController();
$controller->createOrder($user_id,$items,$address_id,$payment_method);

sendResponse(true, "Order placed successfully");