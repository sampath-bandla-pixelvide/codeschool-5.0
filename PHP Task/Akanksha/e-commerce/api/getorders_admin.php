<?php

require_once __DIR__ . "/controllers/ordersController.php";
require_once("./utils/functions.php");

$controller = new ordersController();

$data = $controller->getAllOrders();

sendResponse(true, "All orders", $data);