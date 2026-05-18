<?php
require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../controllers/AuthController.php');

$phone=$_POST['phone']??'';

if (!$phone) {
    sendResponse(false, "Phone required");
}

$controller = new AuthController();
$result = $controller->sendOtp($phone);

// sendResponse($result['status'], $result['message']);