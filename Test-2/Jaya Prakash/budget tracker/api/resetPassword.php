<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = $_POST['token'];
$password = $_POST['password'];
$confirmPassword = $_POST['confirmPassword'];
if (strlen($password) < 6 || strlen($password) > 25 || $password !== $confirmPassword) {
    return sendResponse(false, "Invalid password or password missmatch!!");
}
$authControl = new AuthControllers();
echo $authControl->resetPassword($token,$password);
