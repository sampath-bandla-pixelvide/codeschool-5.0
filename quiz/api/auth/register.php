<?php

require_once(__DIR__ . '/../../controllers/AuthController.php');
require_once(__DIR__ . '/../../helpers/functions.php');

try {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (!$name || !$email || !$password) {
        throw new Exception("All fields are required");
    }

    $controller = new AuthController();
    $controller->register($name, $email, $password);

    sendResponse(true, "User registered successfully");

} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}