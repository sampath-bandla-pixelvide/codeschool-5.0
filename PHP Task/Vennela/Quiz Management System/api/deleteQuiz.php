<?php
require_once "../controllers/QuizController.php";
header("Content-Type: application/json");
require_once(__DIR__."/../utils/functions.php");

verifyToken();
$quiz_id = $_POST['quiz_id'] ?? 0;
$controller = new QuizController();

echo json_encode($controller->deleteQuiz($quiz_id));