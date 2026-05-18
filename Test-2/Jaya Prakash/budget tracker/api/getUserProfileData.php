<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = getTokenFromHeader();

if (!$token) {
    die(sendResponse(false, "Token not found!!"));
}

$authControl = new AuthControllers();
echo $authControl->getUserData($token);