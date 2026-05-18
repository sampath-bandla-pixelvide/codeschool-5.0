<?php

require_once __DIR__ . "/controllers/QuizControllers.php";
require_once __DIR__ . "/utils/functions.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(false, "POST method only");
}

$attempt_id = $_POST["attempt_id"] ?? "";
$question_id = $_POST["question_id"] ?? "";
$selected_answer = $_POST["selected_answer"] ?? "";

$quiz = new QuizControllers();

$quiz->submitAnswer($attempt_id, $question_id, $selected_answer);