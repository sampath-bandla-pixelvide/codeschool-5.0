<?php
require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../middleware/auth.php');
require_once(__DIR__ . '/../controllers/AuthController.php');

$user = verifyToken();
$controller = new AuthController();
$result = $controller->logout($user['id']);

if (isset($result['error'])) {
    sendResponse(false, $result['error']);
} else {
    sendResponse(true, $result['message'], $result);
}