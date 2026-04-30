<?php
require '../utils/pdo.php';
require '../controllers/likeController.php';
header('Content-Type: application/json');
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}
$user_id = $_SESSION['user_id'];
if (!isset($_POST['post_id'])) {
    echo json_encode(["error" => "No post id"]);
    exit;
}
$post_id = intval($_POST['post_id']);
$pdo = getPDO();
$controller = new LikeController($pdo);
$result = $controller->toggleLike($post_id, $user_id);
echo json_encode($result);