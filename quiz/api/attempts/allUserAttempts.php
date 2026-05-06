<?php

require_once(__DIR__ . '/../../controllers/AttemptController.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');

$user = verifyToken();
checkAdmin($user);

$controller = new AttemptController();
$result = $controller->getAllUserAttempts();

sendResponse(true, "Success", $result['data']);