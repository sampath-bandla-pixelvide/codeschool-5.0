<?php

require_once(__DIR__ . '/../../controllers/AttemptController.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');

$user = verifyToken();

$controller = new AttemptController();
$result = $controller->getDashboardStats();

sendResponse(true, "Success", $result['data']);