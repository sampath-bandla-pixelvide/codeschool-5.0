<?php
header("Content-Type: application/json");

require_once(__DIR__ . "/utils/db.php");

$db = new DB();


$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

$token = str_replace("Bearer ", "", $authHeader);

$db->query("SELECT user_id FROM tokens WHERE token = :token");
$user = $db->first([
    ":token" => $token
]);

$user_id = $user['user_id'] ?? null;

if (!$user_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized"
    ]);
    exit;
}


$data = json_decode(file_get_contents("php://input"), true);

$lesson_id = $data['lesson_id'] ?? null;
$course_id = $data['course_id'] ?? null;

if (!$lesson_id || !$course_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing data"
    ]);
    exit;
}


$db->query("
INSERT INTO lesson_progress (user_id, course_id, lesson_id)
VALUES (:user_id, :course_id, :lesson_id)
ON CONFLICT (user_id, lesson_id)
DO NOTHING
");

$success = $db->create([
    ":user_id" => $user_id,
    ":course_id" => $course_id,
    ":lesson_id" => $lesson_id
]);


echo json_encode([
    "status" => "success",
    "inserted" => $success,
    "user_id" => $user_id,
    "lesson_id" => $lesson_id
]);
