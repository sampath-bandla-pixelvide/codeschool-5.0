<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = getTokenFromHeader();
if (!$token) {
    die(sendResponse(false,"Invalid Token!!"));
}
$auth = new AuthControllers();
echo $auth->validateToken($token);