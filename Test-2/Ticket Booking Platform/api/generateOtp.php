<?php
require_once __DIR__ ."/controllers/authControllers.php";
$email=$_POST["email"];
$obj=new AuthController();
$response=$obj->isEmailExists($email);
$otp=rand(100000,999999);
if($response){
    $obj->setOtpAndEmail($email,$otp);
}else{
    return sendResponse(false,"Email do not exists");
}
