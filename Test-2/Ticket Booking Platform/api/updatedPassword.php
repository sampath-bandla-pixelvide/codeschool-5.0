<?php
require_once __DIR__ ."/controllers/authControllers.php";
$email=$_POST["email"];
$password=$_POST["password"];
$confirm_password=$_POST["confirmPassword"];
$obj =new AuthController();
$status=$obj->confirmPasswordStatus($password,$confirm_password); 
if($status){
    $obj->changePassword($email,$password);
}  
