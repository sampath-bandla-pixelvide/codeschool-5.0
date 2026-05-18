<?php
require_once __DIR__ . "/Controllers/AuthController.php";
require_once __DIR__ . "/Utils/functions.php";
require_once __DIR__ . "/validations/register&loginValidations.php";

//header("Content-Type: application/json");


$first_name = trim($_POST["first_name"] ?? "");
$last_name = trim($_POST["last_name"] ?? "");
$email = trim($_POST["email"] ?? "");
$phone_number = trim($_POST["phone_number"] ?? "");
$date_of_birth = trim($_POST["date_of_birth"] ?? "");
$password = trim($_POST["password"] ?? "");
$confirm_password = trim($_POST["confirm_password"] ?? "");

$errors = registerValidations($first_name, $last_name, $email, $phone_number, $date_of_birth, $password, $confirm_password);
if (!empty($errors)) {
    echo sendResponse(false, "Validation Failed!", [], $errors);
    exit;
}

$authController = new AuthControllers();
$response = $authController->register($first_name, $last_name, $email, $phone_number, $date_of_birth, $password);
echo $response;