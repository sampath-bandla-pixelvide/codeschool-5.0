<?php
require_once("./utils/functions.php");
require_once("./utils/db.php");
require_once __DIR__ . '/controllers/ChatController.php';

$token = $_POST['token'] ?? '';
$other_user_id = $_POST['other_user_id'] ?? '';
if (!$token) sendResponse(false, "Token required.");
if (!$other_user_id) sendResponse(false, "Other user ID required.");

$chat = new ChatController();
$userId = $chat->getUserIdFromToken($token);
if (!$userId) sendResponse(false, "Invalid token.");

$chat->getMessages($userId, $other_user_id);
