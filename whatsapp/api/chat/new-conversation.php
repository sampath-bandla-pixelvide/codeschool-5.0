<?php

require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../middleware/auth.php');
require_once(__DIR__ . '/../controllers/ChatController.php');


$user = verifyToken();
$myId = $user['id'];

$otherUserId = $_POST['user_id'] ?? null;

if (!$otherUserId) {
    sendResponse(false, "User ID required");
}

$controller = new ChatController();
$result = $controller->createOrGetConversation($myId, $otherUserId);

sendResponse(true, "Success", $result);