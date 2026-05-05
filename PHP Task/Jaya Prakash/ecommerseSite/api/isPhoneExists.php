<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
$phone = $_POST['phone'] ?? null;

$authController = new AuthControllers();
echo $authController->isPhoneExist($phone);