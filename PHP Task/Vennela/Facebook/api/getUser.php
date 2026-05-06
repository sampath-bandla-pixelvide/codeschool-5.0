<?php
session_start();
require_once "../utils/pdo.php";
header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "not_logged_in"]);
    exit;
}
$pdo = getPDO();
$stmt = $pdo->prepare("SELECT first_name, last_name, profile_pic FROM users WHERE id = :id");
$stmt->execute([':id' => $_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
echo json_encode($user);