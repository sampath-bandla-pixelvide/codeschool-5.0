<?php
require_once __DIR__ . "/../controllers/adminController.php";

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}

$token = getTokenFromHeader();
if (!$token) {
    die(sendResponse(false,"Invalid Token!!"));
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['title']) || !isset($data['target_amount']) || !isset($data['description'])) {
    sendResponse(false, "Invalid data or missing fields");
}

$admin = new adminController();
$admin->addCampaign($token, $data);
