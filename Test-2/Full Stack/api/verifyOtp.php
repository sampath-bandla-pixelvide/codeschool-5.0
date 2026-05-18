<?php

require_once __DIR__ . "/Controllers/AuthController.php";

$temp_token = trim(
    $_POST["temp_token"] ?? ""
);

$otp = trim(
    $_POST["otp"] ?? ""
);

$authController =
    new AuthControllers();

$response =
    $authController->verifyOtp(
        $temp_token,
        $otp
    );

echo $response;