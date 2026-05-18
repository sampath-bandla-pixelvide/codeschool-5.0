<?php
require_once __DIR__ . "/controllers/authControllers.php";
require_once __DIR__ . "/utils/functions.php";
$headers = apache_request_headers();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
if (!$token) {
    sendResponse(false, "Unauthorized access");
}
$currentPassword = isset($_POST['current_password']) ? trim($_POST['current_password']) : '';
$newPassword = isset($_POST['new_password']) ? trim($_POST['new_password']) : '';
if (empty($currentPassword) || empty($newPassword)) {
    sendResponse(false, "Both current and new passwords are required");
}
if (strlen($newPassword) < 8) {
    sendResponse(false, "New password must be at least 8 characters");
}
$auth = new AuthController();
$auth->changePasswordUser($token, $currentPassword, $newPassword);
