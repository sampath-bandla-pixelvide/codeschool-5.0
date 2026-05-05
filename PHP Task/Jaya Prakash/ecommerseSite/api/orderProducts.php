<?php
require_once __DIR__ . "/controllers/OrderControllers.php";

$token = $_POST['token'];
$addressId = $_POST['address_id'];
$paymode = $_POST['payment_method'];
$productId = $_POST['productId'] ?? null;

$orderControl = new OrderControllers();
echo $orderControl->orderCartProducts($token, $addressId, $paymode, $productId);