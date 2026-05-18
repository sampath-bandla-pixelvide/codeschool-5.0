<?php
require_once __DIR__ . "/controllers/authControllers.php";
require_once __DIR__ . "/utils/functions.php";
$headers = apache_request_headers();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
if (!$token) {
    sendResponse(false, "Unauthorized access");
}
if (!isset($_FILES['profile_image']) || $_FILES['profile_image']['error'] !== UPLOAD_ERR_OK) {
    sendResponse(false, "Please select a valid image file");
}
$file = $_FILES['profile_image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$maxSize = 2 * 1024 * 1024; 
if (!in_array($file['type'], $allowedTypes)) {
    sendResponse(false, "Only JPG, PNG, GIF, and WEBP images are allowed");
}
if ($file['size'] > $maxSize) {
    sendResponse(false, "File size must be less than 2MB");
}
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$fileName = uniqid('profile_') . '.' . $ext;
$targetDir = __DIR__ . "/../assets/profiles/";
$targetFilePath = $targetDir . $fileName;
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}
if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
    $relativePath = "./assets/profiles/" . $fileName;
    $auth = new AuthController();
    $auth->updateProfileImage($token, $relativePath);
} else {
    sendResponse(false, "Failed to upload image");
}
