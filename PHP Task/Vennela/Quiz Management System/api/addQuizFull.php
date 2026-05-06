<?php
require_once "../controllers/QuizController.php";
require_once(__DIR__."/../utils/functions.php");
header("Content-Type: application/json");

verifyToken();
$title = $_POST['title'] ?? '';
$subject_id = $_POST['subject_id'] ?? 0;

$questions = json_decode($_POST['questions'] ?? '[]', true);

$controller = new QuizController();

$result = $controller->createFullQuiz($title, $subject_id, $questions);
echo json_encode($result);