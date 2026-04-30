<?php
require_once("./utils/functions.php");
require_once("./utils/db.php");
require_once __DIR__ . '/controllers/ChatController.php';

$token = $_POST['token'] ?? '';
$status = $_POST['status'] ?? '';
if (!$token) sendResponse(false, "Token required.");
if (!$status) sendResponse(false, "Status required.");

$chat = new ChatController();
$userId = $chat->getUserIdFromToken($token);
if (!$userId) sendResponse(false, "Invalid token.");

$chat->updateStatus($userId, $status);
