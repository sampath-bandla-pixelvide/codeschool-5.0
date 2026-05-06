<?php
require_once "../utils/pdo.php";
require_once(__DIR__."/../utils/functions.php");
header("Content-Type: application/json");

verifyToken();
$name = trim($_POST['name'] ?? '');
if (!$name) {
    echo json_encode(["success" => false, "message" => "Name required"]);
    exit;
}
$pdo = getPDO();
$stmt = $pdo->prepare("
    INSERT INTO subjects (name, status)
    VALUES (:name, 'active')
");
$stmt->execute([
    ":name" => $name
]);
echo json_encode(["success" => true]);