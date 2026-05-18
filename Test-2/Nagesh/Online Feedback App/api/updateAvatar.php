<?php
require_once __DIR__ . "/../controllers/UserController.php";

$userId = $_POST['userId'] ?? null;
$image = $_FILES['avatar'] ?? null;

if (!$userId || !$image) {
    echo json_encode(["status" => false, "message" => "Missing required fields"]);
    exit;
}

$userController = new UserController();
$userController->updateAvatar($userId, $image);
