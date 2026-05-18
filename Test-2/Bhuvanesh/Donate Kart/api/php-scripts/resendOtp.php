<?php

require_once __DIR__."/../controllers/authController.php";
require_once __DIR__."/../Validations/Validation.php";


if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}


$temp_token = $_POST['temp_token'];



$auth = new authController();
$auth->resendOTP($temp_token);