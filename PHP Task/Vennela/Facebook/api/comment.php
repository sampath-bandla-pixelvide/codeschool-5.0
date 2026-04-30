<?php
require '../utils/pdo.php';
require '../controllers/commentController.php';
header('Content-Type: application/json');
session_start();
$pdo = getPDO();
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 1; 
}
$user_id = $_SESSION['user_id'];
$post_id = $_POST['post_id'] ?? null;
$comment = trim($_POST['comment'] ?? '');
if (!$post_id || $comment === '') {
    echo json_encode(["error" => "Invalid data"]);
    exit;
}
$controller = new CommentController($pdo);
$result = $controller->addComment($post_id, $user_id, $comment);
echo json_encode($result);