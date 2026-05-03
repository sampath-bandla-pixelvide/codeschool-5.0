<?php
require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../middleware/auth.php');
require_once(__DIR__ . '/../controllers/ChatController.php');

$user = verifyToken();
$myId = $user['id'];
$conversation_id = $_GET['conversation_id'] ?? '';

if (!$conversation_id) {
    sendResponse(false, "conversation_id required");
}

$controller = new ChatController();
$messages = $controller->getMessages($conversation_id,$myId);

sendResponse(true, "Success", $messages);