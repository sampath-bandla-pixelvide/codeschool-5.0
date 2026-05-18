<?php
require_once __DIR__ . "/../controllers/adminController.php";

if ($_SERVER['REQUEST_METHOD'] != 'GET') {
    sendResponse(false, "GET method only");
}

$token = getTokenFromHeader();
if (!$token) {
    die(sendResponse(false,"Invalid Token!!"));
}

$admin = new adminController();
$admin->selectCampaign($token);
