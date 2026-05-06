<?php
session_start();
header("Content-Type: application/json");
require_once "../utils/pdo.php";
require_once(__DIR__."/../utils/functions.php");

if (!isset($_SESSION['user'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}
$pdo = getPDO();
verifyToken();
$sql = "
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    COUNT(a.id) AS quizzes_attempted
FROM users u
LEFT JOIN attempts a ON u.id = a.user_id
GROUP BY u.id
ORDER BY u.id DESC
";
$stmt = $pdo->query($sql);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($data);