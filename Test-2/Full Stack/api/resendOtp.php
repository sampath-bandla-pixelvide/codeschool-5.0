<?php

require_once __DIR__ . "/Controllers/AuthController.php";

$temp_token = trim(
    $_POST["temp_token"] ?? ""
);

$authController =
    new AuthControllers();

$response =
    $authController->resendOtp(
        $temp_token
    );

echo $response;