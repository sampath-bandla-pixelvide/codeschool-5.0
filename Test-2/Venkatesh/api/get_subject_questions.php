<?php

require_once __DIR__ . "/controllers/QuizControllers.php";

$subject_id = $_GET["subject_id"] ?? "";

$quiz = new QuizControllers();

$quiz->getSubjectQuestions($subject_id);