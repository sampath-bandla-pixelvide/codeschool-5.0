<?php
require_once __DIR__ . "/controllers/CartControllers.php";

$token = $_POST['userToken'];
$productId = $_POST['productId'];

$cartControl = new CartControllers();

echo $cartControl->removeCartItem($token, $productId);