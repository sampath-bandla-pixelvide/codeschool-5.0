<?php
require_once(__DIR__."/../utils/functions.php");
header("Content-Type: application/json");
require_once "../controllers/AuthController.php";

// verifyToken();
$controller = new AuthController();
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$token=$controller->login($email, $password);

