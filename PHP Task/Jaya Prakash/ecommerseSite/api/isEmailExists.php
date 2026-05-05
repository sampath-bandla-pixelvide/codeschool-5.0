<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
$email = $_POST['email'] ?? null;

$authController = new AuthControllers();
echo $authController->isEmailExist($email);