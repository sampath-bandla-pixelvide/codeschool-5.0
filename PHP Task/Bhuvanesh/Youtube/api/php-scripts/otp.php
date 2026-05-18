<?php
require __DIR__.'/../validation/checks.php';
require __DIR__.'/../controllers/authController.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}


$otp = $_POST["otp"];

otp($otp);



$auth = new authController();
$auth->verifyOtp($otp);