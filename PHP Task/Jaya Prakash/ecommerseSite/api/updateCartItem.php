<?php
require_once __DIR__ . "/controllers/CartControllers.php";

$token = $_POST['userToken'];
$productId = $_POST['product_id'];
$quantity = $_POST['quantity'];

$cartControl = new CartControllers();

echo $cartControl->updateCartItem($token, $productId, $quantity);
