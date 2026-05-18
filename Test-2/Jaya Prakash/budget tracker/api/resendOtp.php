<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/utils/functions.php";

$temp_token = $_POST['temp_token'] ?? null;

if(!$temp_token){
    return sendResponse(false , "Error occures. please try again later...!");
}

$authControl = new AuthControllers();
echo $authControl->resendOTP($temp_token);