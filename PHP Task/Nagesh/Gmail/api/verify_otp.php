<?php
require_once(__DIR__ . "/../controllers/AuthController.php");
require_once(__DIR__ . "/../config/commonfunctions.php");
require_once(__DIR__ . "/../config/db.php");

header("Content-Type: application/json");

$auth = new AuthController();

$email = trim($_POST['email'] ?? '');
$otp   = trim($_POST['otp'] ?? '');

if (!$email || !$otp) {
    getResponse(false, "Email and OTP required");
}

// Call verify
$auth->verifyOtp($email, $otp);

getResponse(true, "OTP verified successfully");