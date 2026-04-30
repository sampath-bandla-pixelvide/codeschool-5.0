<?php
session_start();
require '../utils/pdo.php';
header("Content-Type: application/json");
error_reporting(0);
$pdo = getPDO();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}
$user_id = $_SESSION['user_id'];
$post_id = isset($_POST['post_id']) ? (int)$_POST['post_id'] : 0;
if ($post_id <= 0) {
    echo json_encode(["error" => "Invalid Post ID"]);
    exit;
}
$check = $pdo->prepare("SELECT user_id FROM posts WHERE id = ?");
$check->execute([$post_id]);
$post = $check->fetch(PDO::FETCH_ASSOC);
if (!$post) {
    echo json_encode(["error" => "Post not found"]);
    exit;
}

if ($post['user_id'] != $user_id) {
    echo json_encode(["error" => "Not allowed"]);
    exit;
}
$stmt = $pdo->prepare("UPDATE posts SET status = FALSE WHERE id = ?");
$success = $stmt->execute([$post_id]);
echo json_encode(["success" => $success]);
