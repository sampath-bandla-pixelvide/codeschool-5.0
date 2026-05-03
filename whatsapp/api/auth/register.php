<?php

require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../controllers/AuthController.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, "POST method only");
}

$username = trim($_POST['username'] ?? '');
$email    = trim($_POST['email'] ?? '');
$phone    = trim($_POST['phone'] ?? '');
$password = $_POST['password'] ?? '';

if (!$username || !$email || !$phone || !$password) {
    sendResponse(false, "All fields are required");
}

$controller = new AuthController();
$result = $controller->register($username, $email, $phone, $password);

if ($result['status']) {
    sendResponse(true, "User registered successfully");
} else {
    sendResponse(false, $result['message']);
}
