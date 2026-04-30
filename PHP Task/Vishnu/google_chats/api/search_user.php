<?php
require_once("./utils/functions.php");
require_once("./utils/db.php");
require_once __DIR__ . '/controllers/ChatController.php';

$token = $_POST['token'] ?? '';
$email = $_POST['email'] ?? '';
if (!$token) sendResponse(false, "Token required.");

$chat = new ChatController();
$userId = $chat->getUserIdFromToken($token);
if (!$userId) sendResponse(false, "Invalid token.");

$chat->searchUser($email, $userId);
