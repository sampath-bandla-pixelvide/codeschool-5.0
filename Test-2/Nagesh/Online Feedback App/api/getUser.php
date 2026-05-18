<?php
require_once __DIR__ . "/../controllers/UserController.php";

$userId = $_GET['userId'] ?? null;

if (!$userId) {
    echo json_encode(["status" => false, "message" => "Missing user ID"]);
    exit;
}

$userController = new UserController();
$userController->getUser($userId);
