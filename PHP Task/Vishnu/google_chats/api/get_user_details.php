<?php
require_once("./utils/functions.php");
require_once("./utils/db.php");
require_once __DIR__ . '/controllers/ChatController.php';

$token = $_POST['token'] ?? '';
$user_id = $_POST['user_id'] ?? '';
if (!$token) sendResponse(false, "Token required.");
if (!$user_id) sendResponse(false, "User ID required.");

$chat = new ChatController();
$myId = $chat->getUserIdFromToken($token);
if (!$myId) sendResponse(false, "Invalid token.");

$chat->getUserDetails($user_id);
