<?php
require_once __DIR__ . "/controllers/AdminControllers.php";

$adminControl = new AdminControllers();

echo $adminControl->getOrders();