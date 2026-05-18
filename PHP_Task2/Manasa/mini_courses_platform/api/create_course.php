<?php
header("Content-Type: application/json");

require_once __DIR__ . "/controllers/CourseController.php";

$data = json_decode(file_get_contents("php://input"), true);

$controller = new CourseController();
$response = $controller->createCourse($data);

echo json_encode($response);