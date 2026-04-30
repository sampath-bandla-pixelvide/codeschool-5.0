<?php

require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../middleware/auth.php');
require_once(__DIR__ . '/../controllers/ChatController.php');

$user=verifyToken();
$message_id=$_POST['message_id']??'';
$type=$_POST['type']??''; // me or everyone

if (!$message_id || !$type) {
    sendResponse(false, "Invalid request");
}

$controller=new ChatController();
$res=$controller->deleteMessage($message_id,$user['id'],$type);

sendResponse(true,"DELETED");