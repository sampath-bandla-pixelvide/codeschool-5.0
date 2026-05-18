<?php
require_once __DIR__ . "/../controllers/authController.php";


if ($_SERVER['REQUEST_METHOD'] != 'GET') {
    sendResponse(false, "GET method only");
}

$token = getTokenFromHeader();
if (!$token) {
    die(sendResponse(false,"Invalid Token!!"));
}
$auth = new authController();
$auth->validateToken($token);