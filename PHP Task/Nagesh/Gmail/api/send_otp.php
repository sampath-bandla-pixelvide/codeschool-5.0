<?php
require_once(__DIR__ . "/../controllers/AuthController.php");
require_once(__DIR__ . "/../config/commonfunctions.php");

header("Content-Type: application/json");


$auth = new AuthController();
$email = trim($_POST['email'] ?? '');

if(!$email) {
    getResponse(false, "Email Required");

}

AuthController::validateEmail($email);
if (!$auth->isEmailExists($email)){
    getResponse(false, "User not found");

}

$result = $auth->generateOtp($email);
getResponse(true, "OTP generated successfully", $result);