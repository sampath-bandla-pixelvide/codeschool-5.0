<?php
require '../utils/pdo.php';
require '../controllers/CommentController.php';
header('Content-Type: application/json');
$pdo = getPDO();
$post_id = $_GET['post_id'] ?? null;
if (!$post_id) {
    echo json_encode([]);
    exit;
}
$controller = new CommentController($pdo);
$comments = $controller->getComments($post_id);
echo json_encode($comments ?: []);