
<?php
require_once(__DIR__ . "/../controllers/AuthController.php");
require_once(__DIR__ . "/../config/commonfunctions.php");

header("Content-Type: application/json");

$auth = new AuthController();

$email    = trim($_POST['email'] ?? '');
$otp      = trim($_POST['otp'] ?? '');
$password = $_POST['password'] ?? '';

// 1. Validate inputs
if (!$email || !$otp || !$password) {
    getResponse(false, "Email, OTP and Password are required");
}


AuthController::validateEmail($email);
AuthController::validatePassword($password);


$auth->resetPassword($email, $otp, $password);

getResponse(true, "Password reset successful");


