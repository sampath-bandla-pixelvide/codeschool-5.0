<?php

require_once __DIR__ . "/../controllers/AuthController.php";
require_once __DIR__ . "/../utils/functions.php";

$email = trim($_POST['email'] ?? '');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, "Invalid email");
}

$authControl = new AuthController();
$authControl->getOTP($email);