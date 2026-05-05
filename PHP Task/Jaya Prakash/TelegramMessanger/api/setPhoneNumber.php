<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/utils/functions.php";

$phone_number = $_POST['number'] ?? $_SESSION['phone'];
$rememberMe = $_POST['rememberMe'] ?? $_SESSION['rememberMe'];

// validations;

if(!$phone_number){
    die(sendResponse(false,"Invalid Phone Number"));
}
$auth = new AuthControllers();
echo $auth->setOptAndPhone($phone_number,$rememberMe);