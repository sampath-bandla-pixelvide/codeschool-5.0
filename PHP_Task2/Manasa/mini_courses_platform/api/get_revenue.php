<?php
header("Content-Type: application/json");
require_once(__DIR__ . "/utils/db.php");

$db = new DB();


$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = str_replace("Bearer ", "", $authHeader);

$db->query("SELECT user_id FROM tokens WHERE token = :token");
$user = $db->first([":token" => $token]);

$user_id = $user['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}


$db->query("
SELECT SUM(c.price) AS total_revenue
FROM enrollments e
JOIN courses c ON c.id = e.course_id
");

$result = $db->first();

echo json_encode([
    "status" => "success",
    "revenue" => $result['total_revenue'] ?? 0
]);
