<?php
header("Content-Type: application/json");

require_once "verifyToken.php";
require_once "controllers/CourseController.php";

$user = verifyToken();

if (!$user) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$course_id = $_GET['course_id'] ?? null;

if (!$course_id) {
    echo json_encode(["status" => "error", "message" => "Course ID required"]);
    exit;
}

$controller = new CourseController();
$lessons = $controller->getLessonsByCourse($course_id);

echo json_encode([
    "status" => "success",
    "lessons" => $lessons
]);
