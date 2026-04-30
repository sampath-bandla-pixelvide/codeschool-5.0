<?php
require_once("./utils/functions.php");
require_once("./utils/db.php");
require_once __DIR__ . '/controllers/ChatController.php';

$token = $_POST['token'] ?? '';
$message_id = $_POST['message_id'] ?? '';
if (!$token) sendResponse(false, "Token required.");
if (!$message_id) sendResponse(false, "Message ID required.");

$chat = new ChatController();
$userId = $chat->getUserIdFromToken($token);
if (!$userId) sendResponse(false, "Invalid token.");

$chat->toggleStar($userId, $message_id);
