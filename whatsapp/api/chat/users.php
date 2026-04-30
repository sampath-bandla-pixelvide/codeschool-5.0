<?php
require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../middleware/auth.php');
require_once(__DIR__ . '/../controllers/ChatController.php');

$user = verifyToken();

$controller = new ChatController();
$data = $controller->getUsers($user['id']);

sendResponse(true, "Users fetched", $data);