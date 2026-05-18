<?php

require_once __DIR__ ."/utils/db.php";
require_once __DIR__ ."/controllers/AuthControllers.php";

$email=$_POST["email"];
$password=$_POST["password"];

$isValidEmail =AuthController::validateEmail($email);
$isValidPassword=AuthController::validatePassword($password);

if($isValidEmail && $isValidPassword) {
    $obj=new AuthController();
    echo $obj->login($email, $password); 
}