<?php
header("Content-Type: application/json");

require_once "verifyToken.php";
require_once "utils/db.php";

$user = verifyToken();

if (!$user) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$db = new DB();

$db->query("
    SELECT c.* 
    FROM courses c
    INNER JOIN enrollments e ON c.id = e.course_id
    WHERE e.user_id = :user_id
    ORDER BY c.id DESC
");

$courses = $db->get([
    ":user_id" => $user['id']
]);

echo json_encode([
    "status" => "success",
    "courses" => $courses
]);
