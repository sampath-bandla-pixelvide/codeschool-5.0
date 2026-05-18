<?php

require_once __DIR__ . "/controllers/QuizControllers.php";
require_once __DIR__ . "/utils/functions.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(false, "POST method only");
}

$user_id = $_POST["user_id"] ?? "";
$subject_id = $_POST["subject_id"] ?? "";

$quiz = new QuizControllers();

$quiz->startAttempt($user_id, $subject_id);