<?php
require_once __DIR__ . "/utils/functions.php";
require_once __DIR__ . "/validations/formValidations.php";
require_once __DIR__ . "/controllers/AuthControllers.php";

$firstName = $_POST['firstName'] ?? null;
$lastName = $_POST['lastName'] ?? null;
$email = $_POST['email'] ?? null;
$phone = $_POST['phone'] ?? null;
$password = $_POST['password'] ?? null;
$confirmPassword = $_POST['confirmPassword'] ?? null;

$result = registerFormValidations($firstName, $lastName, $email, $phone, $password, $confirmPassword);

if (!$result['status']) {
    die(sendResponse(false,"Form Validations Failed",$result['errors']));
} else {
    
$authController = new AuthControllers();
echo $authController->register($firstName,$lastName,$email,$phone,$password); 
}
