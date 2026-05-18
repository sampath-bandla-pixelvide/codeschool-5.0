<?php

header("Content-Type: application/json");

require_once(__DIR__ . "/controllers/AuthController.php");
require_once(__DIR__ . "/php_formValidations/registerValidation.php");

$data = json_decode(file_get_contents("php://input"), true);


$validator = new RegisterValidation();
$errors = $validator->validate($data);

if (!empty($errors)) {
    echo json_encode([
        "status" => "error",
        "errors" => $errors
    ]);
    exit;
}

$auth = new AuthController();
$response = $auth->register($data);

echo json_encode($response);