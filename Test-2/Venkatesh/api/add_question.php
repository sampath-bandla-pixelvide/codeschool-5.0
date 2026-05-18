<?php

require_once __DIR__ . "/controllers/QuizControllers.php";
require_once __DIR__ . "/utils/functions.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(false, "POST method only");
}

$subject_id = $_POST["subject_id"] ?? "";
$question = $_POST["question"] ?? "";
$option_a = $_POST["option_a"] ?? "";
$option_b = $_POST["option_b"] ?? "";
$option_c = $_POST["option_c"] ?? "";
$option_d = $_POST["option_d"] ?? "";
$correct_answer = $_POST["correct_answer"] ?? "";

$quiz = new QuizControllers();

$quiz->addQuestion(
    $subject_id,
    $question,
    $option_a,
    $option_b,
    $option_c,
    $option_d,
    $correct_answer
);