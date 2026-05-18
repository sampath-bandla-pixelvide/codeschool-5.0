<?php

require_once __DIR__ . "/controllers/QuizControllers.php";
require_once __DIR__ . "/utils/functions.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(false, "POST method only");
}

$attempt_id = $_POST["attempt_id"] ?? "";

$quiz = new QuizControllers();

$quiz->finishQuiz($attempt_id);