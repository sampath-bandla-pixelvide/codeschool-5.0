<?php
require_once __DIR__ . "/controllers/AdminControllers.php";

$token = $_POST['userToken'];
$status = $_POST['status'];
$orderId = $_POST['id'];

$adminControl = new AdminControllers();
echo $adminControl->updateOrderStatus($token,$orderId,$status);