<?php

require_once __DIR__ . "/utils/functions.php";
require_once __DIR__ . "/controllers/AuthControllers.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(false, "POST method only");
}

$email = $_POST["email"] ?? "";
$otp = $_POST["otp"] ?? "";
$password = $_POST["password"] ?? "";

$auth = new AuthControllers();

$auth->resetPassword($email, $otp, $password);