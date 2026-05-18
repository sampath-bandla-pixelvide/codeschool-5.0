  <?php

require_once __DIR__ . "/../controllers/AuthController.php";
require_once __DIR__ . "/../utils/functions.php";

$email = trim($_POST['email'] ?? '');
$otp = trim($_POST['otp'] ?? '');

if (!$email || !$otp) {
    sendResponse(false, "Email and OTP required");
}

$authControl = new AuthController();

$authControl->verifyOtp($email, $otp);