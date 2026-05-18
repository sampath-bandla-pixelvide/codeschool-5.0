<?php

require_once __DIR__ . "/../controllers/AuthController.php";
require_once __DIR__ . "/../validations/formValidations.php";

$userEmail = trim($_POST['email'] ?? '');
$userPassword = $_POST['password'] ?? '';
$rememberMe = ($_POST['rememberMe'] ?? 'false') === 'true';

if (!loginFormValidations($userEmail, $userPassword)) {
    sendResponse(false, "Invalid login credentials");
}

$authControls = new AuthController();
$authControls->login($userEmail, $userPassword, $rememberMe);