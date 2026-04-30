<?php
require __DIR__.'/../validation/checks.php';
require __DIR__.'/../controllers/authController.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}


$otp = $_POST["otp"];

otp($otp);

if(!empty($errorsArray)) {
    echo json_encode([
        "status" => false,
        "message" => "Validation errors",
        "data" => $errorsArray
    ]);
    exit;
}

$auth = new authController();
$auth->verifyOtp($otp);