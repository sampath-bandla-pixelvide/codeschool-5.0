<?php

require_once __DIR__ . "/controllers/QuizControllers.php";

$quiz = new QuizControllers();

$quiz->getAllResults();