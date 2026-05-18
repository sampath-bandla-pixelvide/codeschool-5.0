<?php

require_once __DIR__ . "/controllers/QuizControllers.php";
require_once __DIR__ . "/utils/functions.php";

$user_id = $_GET["user_id"] ?? "";

$quiz = new QuizControllers();

$quiz->getMyResults($user_id);