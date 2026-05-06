<?php
require_once "../controllers/QuizController.php";
require_once(__DIR__."/../utils/functions.php");

$controller = new QuizController();
verifyToken();
echo json_encode(
    $controller->updateQuiz(
        $_POST['quiz_id'],
        $_POST['title'],
        $_POST['subject_id'],
        json_decode($_POST['questions'], true)
    )
);