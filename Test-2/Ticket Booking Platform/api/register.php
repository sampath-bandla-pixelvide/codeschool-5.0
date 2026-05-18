<?php
require_once __DIR__ ."/controllers/authControllers.php";
$firstName       = $_POST["firstName"]       ?? '';
$lastName        = $_POST["lastName"]        ?? '';
$email           = $_POST["email"]           ?? '';
$dob             = $_POST["dob"]             ?? '';
$phoneno         = $_POST["phone"]           ?? '';
$password        = $_POST["password"]        ?? '';
$confirmPassword = $_POST["confirmPassword"] ?? '';
$role            = $_POST["role"]            ?? 'user';
if (!in_array($role, ['user', 'admin'])) {
    require_once __DIR__ . "/utils/functions.php";
    sendResponse(false, "Invalid role selected");
}
$isValidEmail          = AuthController::validateEmail($email);
$isValidFirstName      = AuthController::validateName($firstName);
$isValidLastName       = AuthController::validateName($lastName);
$isValidPhone          = AuthController::validatePhone($phoneno);
$isValidDob            = AuthController::validateDob($dob);
$isValidPassword       = AuthController::validatePassword($password);
$confirmPasswordStatus = AuthController::confirmPasswordStatus($password, $confirmPassword);
if ($isValidEmail && $isValidFirstName && $isValidLastName && $isValidPhone && $isValidDob && $isValidPassword && $confirmPasswordStatus) {
    $obj = new AuthController();
    $obj->register($firstName, $lastName, $email, $dob, $phoneno, $password, $role);
}
