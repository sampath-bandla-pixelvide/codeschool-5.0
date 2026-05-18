<?php

require_once __DIR__ . "/controllers/addressController.php";

if (!isset($_GET['user_id'])) {
    echo json_encode([
        "status" => false,
        "message" => "User ID required"
    ]);
    exit;
}

$user_id = $_GET['user_id'];

$controller = new addressController();

$data = $controller->getAddresses($user_id);

echo json_encode([
    "status" => true,
    "data" => $data
]);