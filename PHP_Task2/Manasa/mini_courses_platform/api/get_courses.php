<?php
header("Content-Type: application/json");

require_once "verifyToken.php";
require_once "controllers/CourseController.php";

$user = verifyToken();

if (!$user) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$courseController = new CourseController();

$courses = $courseController->getCoursesByAdmin($user['id']);

echo json_encode([
    "status" => "success",
    "courses" => $courses
]);
