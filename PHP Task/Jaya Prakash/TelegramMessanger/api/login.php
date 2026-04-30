<?php
require_once __DIR__ . "/controllers/AuthControllers.php";

$phone = $_SESSION['phone'];
$rememberMe = $_SESSION['rememberMe'] ?? false;

$auth = new AuthControllers();
echo $auth->login($phone,$rememberMe);
