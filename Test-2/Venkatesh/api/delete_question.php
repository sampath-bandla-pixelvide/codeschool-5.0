<?php

require_once __DIR__ . "/controllers/QuizControllers.php";
require_once __DIR__ . "/utils/functions.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(false, "POST method only");
}

$id = $_POST["id"] ?? "";

$quiz = new QuizControllers();

$quiz->deleteQuestion($id);