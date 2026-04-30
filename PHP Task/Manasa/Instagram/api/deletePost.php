<?php

session_start();

require_once __DIR__ . "/controllers/AuthController.php";
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}

$postId = $_POST['post_id'] ?? null;


if (!$postId) {
    echo json_encode(["status" => "error", "message" => "Post ID missing"]);
    exit;
}

$controller = new AuthController();

$response = $controller->deletePost($postId);

echo json_encode($response);
