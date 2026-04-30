<?php
require __DIR__.'/../validation/checks.php';
require __DIR__.'/../controllers/authController.php';

$email = $_POST["email"];

email($email);

if(!empty($errorsArray)) {
    echo json_encode([
        "status" => false,
        "message" => "Validation errors",
        "data" => $errorsArray
    ]);
    exit;
}
$auth = new authController();
$auth->checkEmail($email);