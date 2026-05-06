<?php
require_once("./utils/functions.php");
require_once("./utils/db.php");
require_once __DIR__ . '/controllers/ChatController.php';

$token = $_POST['token'] ?? '';
$to_user_id = $_POST['to_user_id'] ?? '';
$message = $_POST['message'] ?? '';
if (!$token) sendResponse(false, "Token required.");
if (!$to_user_id) sendResponse(false, "Recipient required.");

$chat = new ChatController();
$userId = $chat->getUserIdFromToken($token);
if (!$userId) sendResponse(false, "Invalid token.");

$chat->sendMessage($userId, $to_user_id, $message);
