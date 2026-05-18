<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = getTokenFromHeader();

if(!$token){
    return sendResponse(false, "Invalid Token");
}

$auth = new AuthControllers();
echo $auth->logout($token);
