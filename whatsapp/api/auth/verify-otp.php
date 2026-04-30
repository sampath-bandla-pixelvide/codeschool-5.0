<?php

require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../controllers/AuthController.php');


$phone = trim($_POST['phone'] ?? '');
$otp   = trim($_POST['otp'] ?? '');

if (!$phone || !$otp) {
    sendResponse(false, "Phone and OTP required");
}

$controller = new AuthController();
$result = $controller->verifyOtp($phone, $otp);

