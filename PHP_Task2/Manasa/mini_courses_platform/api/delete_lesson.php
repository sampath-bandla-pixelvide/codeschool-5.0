<?php
header("Content-Type: application/json");

require_once "controllers/CourseController.php";

$data = json_decode(file_get_contents("php://input"), true);

$controller = new CourseController();
$response = $controller->deleteLesson($data);

echo json_encode($response);