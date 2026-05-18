<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/utils/functions.php";

$email = $_POST['email'];

if(!filter_var($email,FILTER_VALIDATE_EMAIL)){
    die(sendResponse(false,"invalid email"));
}

$authControl = new AuthControllers();
echo $authControl->getOTP($email);
