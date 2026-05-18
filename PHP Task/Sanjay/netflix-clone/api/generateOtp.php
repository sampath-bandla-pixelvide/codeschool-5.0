<?php

require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/utils/functions.php";

$email = $_POST["email"];
$obj = new AuthController();
$response = $obj->isEmailExists($email);

$otp = rand(100000, 999999);

if ($response) {
    $obj->setOptAndEmail($email, $otp);
} 
else {
    return sendResponse(false, "User do not exists");
}
