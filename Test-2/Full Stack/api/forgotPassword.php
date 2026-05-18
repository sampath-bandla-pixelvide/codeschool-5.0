<?php

require_once __DIR__ . "/Controllers/AuthController.php";
require_once __DIR__ . "/Utils/functions.php";

$forgot_input = trim($_POST["forgot_input"] ?? "");

if (empty($forgot_input)) {

    echo sendResponse(
        false,
        "Email or Phone Number is required!"
    );

    exit;
}

$authController = new AuthControllers();

$response = $authController->forgotPassword(
    $forgot_input
);

echo $response;