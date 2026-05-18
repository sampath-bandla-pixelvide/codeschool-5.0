<?php

require_once __DIR__."/../controllers/authController.php";
require_once __DIR__."/../Validations/Validation.php";


if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}

$otp = $_POST['otp'];
$temp_token = $_POST['token'];

otp($otp);

$auth = new authController();
$auth->verifyOtp($temp_token,$otp);