<?php
require_once __DIR__ . "/controllers/CartControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = $_POST['userToken'] ?? null;
$productId = $_POST['id'] ?? null;
$quantity = $_POST['quantity'] ?? 1;

$cartControl = new CartControllers();
echo $cartControl->addToCart($token, $productId, $quantity);