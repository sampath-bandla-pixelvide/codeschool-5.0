<?php

require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../controllers/AuthController.php');

$email    = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    sendResponse(false, "Email and password required");
}

$controller = new AuthController();
$result = $controller->loginWithPassword($email, $password);


sendResponse(true, "Login success", [
    "token" => $result['token']
]);
