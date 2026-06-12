<?php 
require_once __DIR__ . "/controllers/CartControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = $_POST['userToken'];

$cartControl = new CartControllers();
echo $cartControl->getCartItems($token);
