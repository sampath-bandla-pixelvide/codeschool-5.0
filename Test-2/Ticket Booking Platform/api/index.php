<?php
require_once __DIR__ . "/controllers/authControllers.php";
$email = $_POST["email"];
$password = $_POST["password"]; 
$isValidEmail = AuthController::validateEmail($email);
$isValidPasswd = AuthController::validatePassword($password);
if ($isValidEmail && $isValidPasswd) {
    $obj = new AuthController();
    $obj->login($email, $password);
}
