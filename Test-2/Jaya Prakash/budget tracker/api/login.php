<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/validations/formValidations.php";

$userEmail = $_POST['email'];
$userPassword = $_POST['password'];
$rememberMe = $_POST['rememberMe'];

if(!loginFormValidations($userEmail,$userPassword)){
    die(sendResponse(false,"Invalid login credentials"));
}

$authControls = new AuthControllers();
echo $authControls->login($userEmail,$userPassword,$rememberMe);
