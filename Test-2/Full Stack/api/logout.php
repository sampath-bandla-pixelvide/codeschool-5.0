<?php

require_once __DIR__ . "/Controllers/AuthController.php";
require_once __DIR__ . "/Utils/functions.php";

$token = getTokenFromHeader();

if (empty($token)) {

    echo sendResponse(
        false,
        "Token required!"
    );

    exit;
}

$authController =
    new AuthControllers();

$response =
    $authController->logout(
        $token
    );

echo $response;
