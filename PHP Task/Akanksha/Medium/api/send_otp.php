<?php
require_once __DIR__ . '/controllers/authController.php';
//require_once("./utils/functions.php");

$email = $_POST['email'];
$name = $_POST['name'];

if (empty($email) || empty($name)) {
    sendResponse(false, "Email and name required");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, "Invalid email format");
}

$auth = new AuthController();
$auth->sendOtp($email,$name);
