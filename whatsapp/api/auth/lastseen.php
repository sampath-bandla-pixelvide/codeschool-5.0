<?php

require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../middleware/auth.php');
require_once(__DIR__ . '/../controllers/ChatController.php');

$user = verifyToken();

$conversationId = $_GET['conversation_id'];

$controller = new ChatController();
$data = $controller->last_seen($conversationId, $user['id']);

sendResponse(true, "Success", $data);