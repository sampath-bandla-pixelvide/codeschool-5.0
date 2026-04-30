<?php
session_start();
require_once "C:\Users\Sudheer Abhimanyu\OneDrive\Desktop\Instagram\api\utils\db.php";

error_reporting(E_ALL);
ini_set('display_errors', 1);

$db = new DB();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$post_id = $_POST['post_id'] ?? null;

if (!$post_id) {
    echo json_encode(["status" => "error", "message" => "Post ID missing"]);
    exit;
}


$db->query("SELECT id FROM likes WHERE user_id = :user_id AND post_id = :post_id");

$existing = $db->first([
    ":user_id" => $user_id,
    ":post_id" => $post_id
]);

if ($existing) {

    $db->query("DELETE FROM likes WHERE user_id = :user_id AND post_id = :post_id");

    $db->delete([
        ":user_id" => $user_id,
        ":post_id" => $post_id
    ]);

    echo json_encode(["status" => "success", "action" => "unliked"]);

} else {

    $db->query("INSERT INTO likes (user_id, post_id) VALUES (:user_id, :post_id)");

    $db->create([
        ":user_id" => $user_id,
        ":post_id" => $post_id
    ]);

    echo json_encode(["status" => "success", "action" => "liked"]);
}