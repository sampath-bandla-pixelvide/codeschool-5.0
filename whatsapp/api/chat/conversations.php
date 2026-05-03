<?php
require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../middleware/auth.php');
require_once(__DIR__ . '/../controllers/ChatController.php');

$user = verifyToken();
$search = $_GET['search'] ?? '';
$controller = new ChatController();
$conversations = $controller->getConversations($user['id'],$search);

sendResponse(true, "Success", $conversations);
