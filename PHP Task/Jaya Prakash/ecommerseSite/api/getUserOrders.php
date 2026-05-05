<?php
require_once __DIR__ . "/controllers/OrderControllers.php";

$token = $_POST["userToken"];
$status = $_POST["status"] ?? null;

$ordersControl = new OrderControllers();
echo $ordersControl->getUserOrders($token,$status);