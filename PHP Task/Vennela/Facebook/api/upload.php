<?php
require_once "../controllers/PostController.php";
session_start();
$controller = new PostController();
if (!isset($_SESSION['user_id'])) {
    echo "not_logged_in";
    exit;
}
$user_id = $_SESSION['user_id'];
$uploadDir = "../Images/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}
$text = isset($_POST['text']) ? $_POST['text'] : "";
$filePath = "";
if (isset($_FILES['file']) && $_FILES['file']['error'] == 0) {
    $originalName = $_FILES['file']['name'];
    $tmpName = $_FILES['file']['tmp_name'];
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    $fileName = time() . "_" . uniqid() . "." . $extension;
    $filePath = $uploadDir . $fileName;
    move_uploaded_file($tmpName, $filePath);
}
$result = $controller->createPost($text, $filePath, $user_id);
echo $result ? "success" : "db_error";
?>