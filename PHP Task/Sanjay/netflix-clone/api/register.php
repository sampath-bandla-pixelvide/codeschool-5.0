<?php

require_once __DIR__ ."/controllers/AuthControllers.php";
require_once __DIR__ ."/utils/db.php";

$first_name=$_POST["firstName"];
$last_name=$_POST["lastName"];
$email=$_POST["email"];
$dob=$_POST["dob"];
$password=$_POST["password"];
$confirm_password=$_POST["confirmPassword"];

$isValidFirstName = AuthController::validateName($first_name);
$isValidLastName = AuthController::validateName($last_name);
$isValidEmail = AuthController::validateEmail($email);
$isValidDob = AuthController::validateDob($dob);
$isValidPassword = AuthController::validatePassword($password);
$confirmPasswordStatus = AuthController::confirmPasswordStatus($password, $confirm_password);


if($isValidFirstName && $isValidLastName && $isValidEmail && $isValidDob && $isValidPassword && $confirmPasswordStatus) {
    $obj= new AuthController();
    echo $obj->register($first_name, $last_name, $email, $dob, $password);
}