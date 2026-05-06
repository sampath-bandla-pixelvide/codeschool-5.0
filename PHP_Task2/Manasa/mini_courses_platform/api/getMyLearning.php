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
SELECT 
    c.id AS course_id,
    c.title,
    COUNT(l.id) AS total_lessons,
    COUNT(lp.lesson_id) AS completed_lessons,
    ROUND(
        (COUNT(lp.lesson_id)::decimal / NULLIF(COUNT(l.id), 0)) * 100
    ) AS progress
FROM enrollments e
JOIN courses c ON c.id = e.course_id
LEFT JOIN lessons l ON l.course_id = c.id
LEFT JOIN lesson_progress lp 
    ON lp.lesson_id = l.id 
    AND lp.user_id = e.user_id
WHERE e.user_id = :user_id
GROUP BY c.id
");

$data = $db->get([
    ":user_id" => $user_id
]);

echo json_encode($data);
