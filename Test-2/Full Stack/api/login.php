<?php

require_once __DIR__ . "/Controllers/AuthController.php";
require_once __DIR__ . "/Utils/functions.php";
require_once __DIR__ . "/validations/register&loginValidations.php";

$login_input = trim($_POST["login_input"] ?? "");
$password = trim($_POST["password"] ?? "");
$remember_me = ($_POST["remember_me"] ?? "false") === "true";

if (!loginValidations($login_input, $password)) {
    echo sendResponse(false, "Validation Failed!");
    exit;
}

$authController = new AuthControllers();

$response = $authController->login(
    $login_input,
    $password,
    $remember_me
);

echo $response;