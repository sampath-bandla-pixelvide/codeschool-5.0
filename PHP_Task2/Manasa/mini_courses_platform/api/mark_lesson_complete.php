<?php
require_once(dirname(__DIR__) . "/utils/db.php");
session_start();

$db = new DB();

$user_id = $_SESSION['user']['id'];
$lesson_id = $_POST['lesson_id'];
$course_id = $_POST['course_id'];

$db->query("
INSERT INTO lesson_progress (user_id, course_id, lesson_id)
VALUES (:user_id, :course_id, :lesson_id)
ON CONFLICT (user_id, lesson_id) DO NOTHING
");

$db->create([
    ":user_id" => $user_id,
    ":course_id" => $course_id,
    ":lesson_id" => $lesson_id
]);

echo json_encode(["message" => "Lesson marked completed"]);
