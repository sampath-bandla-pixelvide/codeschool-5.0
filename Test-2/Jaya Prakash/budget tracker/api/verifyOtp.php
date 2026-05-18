<?php
require_once __DIR__ . "/controllers/AuthControllers.php";

$token = $_POST['token'];
$otp = $_POST['otp'];

$authControl = new AuthControllers();
echo $authControl->verifyOtp($token,$otp);
