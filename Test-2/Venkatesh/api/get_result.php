<?php

require_once __DIR__ . "/controllers/QuizControllers.php";
require_once __DIR__ . "/utils/functions.php";

$attempt_id = $_GET["attempt_id"] ?? "";

$quiz = new QuizControllers();

$quiz->getResult($attempt_id);