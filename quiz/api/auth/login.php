<?php

require_once(__DIR__ . '/../../controllers/AuthController.php');
require_once(__DIR__ . '/../../helpers/functions.php');

$email = trim($_POST['email'] ?? '');
$password = trim($_POST['password'] ?? '');

if (!$email || !$password) {
        sendResponse(false,"Email and password required");
}

$controller = new AuthController();
$result = $controller->login($email, $password);

sendResponse(true, "Login successful", $result);