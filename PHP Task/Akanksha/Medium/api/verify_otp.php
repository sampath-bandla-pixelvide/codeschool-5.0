<?php
require_once __DIR__ . '/controllers/authController.php';

$email = $_POST['email'];
$otp = $_POST['otp'];
$name = $_POST['name'] ?? null;

$auth = new AuthController();
$auth->verifyOtp($email,$otp,$name);
