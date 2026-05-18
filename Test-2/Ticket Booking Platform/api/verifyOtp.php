<?php 
require_once __DIR__ ."/controllers/authControllers.php";
$email=$_POST["email"];
$otp=$_POST["otp"];
$obj=new AuthController();
$obj->verifyOtp($email,$otp);