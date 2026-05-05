<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/validations/formValidations.php";
require_once __DIR__ . "/utils/functions.php";

$email = $_POST['email'];
$password = $_POST["password"];

$result = loginFormValidations($email, $password);

if (!$result['status']) {
    die(sendResponse(false,"Form Validations Failed",$result['errors']));
} else {
    
$authController = new AuthControllers();
echo $authController->login($email,$password);
}