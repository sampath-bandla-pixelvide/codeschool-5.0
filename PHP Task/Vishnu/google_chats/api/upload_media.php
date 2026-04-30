<?php
require_once("./utils/functions.php");
require_once("./utils/db.php");
require_once __DIR__ . '/controllers/ChatController.php';

$token = $_POST['token'] ?? '';
$to_user_id = $_POST['to_user_id'] ?? '';
if (!$token) sendResponse(false, "Token required.");
if (!$to_user_id) sendResponse(false, "Recipient required.");
if (!isset($_FILES['media']) || $_FILES['media']['error'] !== UPLOAD_ERR_OK) {
    sendResponse(false, "No file uploaded or upload error.");
}

$chat = new ChatController();
$userId = $chat->getUserIdFromToken($token);
if (!$userId) sendResponse(false, "Invalid token.");

$chat->sendMedia($userId, $to_user_id, $_FILES['media']);
