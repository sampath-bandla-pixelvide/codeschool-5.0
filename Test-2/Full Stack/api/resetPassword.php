<?php

require_once __DIR__ . "/Controllers/AuthController.php";
require_once __DIR__ . "/Utils/functions.php";

$temp_token = trim(
    $_POST["temp_token"] ?? ""
);

$password = trim(
    $_POST["password"] ?? ""
);

// Validate empty fields
if (
    empty($temp_token) ||
    empty($password)
) {

    echo sendResponse(
        false,
        "All fields are required!"
    );

    exit;
}

$authController =
    new AuthControllers();

$response =
    $authController->resetPassword(
        $temp_token,
        $password
    );

echo $response;