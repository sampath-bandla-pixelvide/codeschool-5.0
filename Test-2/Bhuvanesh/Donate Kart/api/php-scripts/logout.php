<?php
require_once __DIR__ . "/../controllers/authController.php";
require_once __DIR__ . "/../utils/functions.php";

$token = getTokenFromHeader();

if(!$token){
    return sendResponse(false, "Invalid Token");
}

$auth = new authController();
echo $auth->logout($token);
