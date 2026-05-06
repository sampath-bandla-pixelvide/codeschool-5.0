<?php
require_once "../controllers/PostController.php";
header('Content-Type: application/json');
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}
$controller = new PostController();
$posts = $controller->getPosts($_SESSION['user_id']);
echo json_encode($posts);