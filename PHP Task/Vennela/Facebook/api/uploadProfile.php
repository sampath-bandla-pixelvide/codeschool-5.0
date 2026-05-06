<?php
session_start();
require_once __DIR__ . "/../utils/pdo.php";

if (!isset($_SESSION['user_id'])) {
    echo "not_logged_in";
    exit;
}
$user_id = $_SESSION['user_id'];
$uploadDir = "../Images/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}
if (!isset($_FILES['file']) || $_FILES['file']['error'] != 0) {
    echo "no_file";
    exit;
}
$originalName = $_FILES['file']['name'];
$tmpName = $_FILES['file']['tmp_name'];
$extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png'];

if (!in_array($extension, $allowed)) {
    echo "invalid_file";
    exit;
}
$fileName = time() . "_" . uniqid() . "." . $extension;
$filePath = "Images/" . $fileName;
move_uploaded_file($tmpName, "../" . $filePath);
$pdo = getPDO();
$stmt = $pdo->prepare("UPDATE users SET profile_pic = :pic WHERE id = :id");
$stmt->execute([
    'pic' => $fileName,  
    'id'  => $user_id
]);
echo "success";