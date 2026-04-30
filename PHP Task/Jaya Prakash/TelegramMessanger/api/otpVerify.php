<?php
require_once __DIR__ . "/controllers/AuthControllers.php";

$otp = $_POST["otp"];
$phone = $_SESSION["phone"];
// validate;

$auth = new AuthControllers();

echo $auth->verifyOtp($phone,$otp);