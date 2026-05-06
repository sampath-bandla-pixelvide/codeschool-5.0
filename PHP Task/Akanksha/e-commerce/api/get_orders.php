
<?php

require_once("./utils/functions.php");
require_once __DIR__ . "/controllers/ordersController.php";

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    sendResponse(false,"User ID is required");
    exit;
}

$controller = new ordersController();
$data = $controller->getOrders($user_id);

 sendResponse(true,"orders displayed",$data);
