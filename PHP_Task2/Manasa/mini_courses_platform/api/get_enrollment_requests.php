<?php
header("Content-Type: application/json");

require_once "verifyToken.php";
require_once "utils/db.php";

$user = verifyToken();

if (!$user || $user['role'] !== 'admin') {
    echo json_encode(["status" => "error"]);
    exit;
}

$db = new DB();

$db->query("
SELECT er.id, er.user_id, er.course_id, er.status,
       u.name AS user_name,
       c.title AS course_title
FROM enrollment_requests er
JOIN users u ON u.id = er.user_id
JOIN courses c ON c.id = er.course_id
WHERE er.status = 'pending'
ORDER BY er.id DESC
");

$requests = $db->get();

echo json_encode([
    "status" => "success",
    "requests" => $requests
]);