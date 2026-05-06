<?php
header("Content-Type: application/json");

require_once "verifyToken.php";
require_once "utils/db.php";

$user = verifyToken();

if (!$user) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$lesson_id = $data['lesson_id'] ?? null;

if (!$lesson_id) {
    echo json_encode(["status" => "error", "message" => "Lesson ID required"]);
    exit;
}

$db = new DB();

$db->query("
DELETE FROM lesson_progress 
WHERE user_id = :user_id 
AND lesson_id = :lesson_id
");

$db->delete([
    ":user_id" => $user['id'],
    ":lesson_id" => $lesson_id
]);

echo json_encode(["status" => "success"]);