<?php
require_once __DIR__ . '/../controllers/authController.php';



if ($_SERVER['REQUEST_METHOD'] != 'POST' && $_SERVER['REQUEST_METHOD'] != 'GET') {
    sendResponse(false, "Invalid method");
}

$headers = getallheaders();
if (!isset($headers['Authorization'])) return sendResponse(false, "Authorization header missing");
$authHeader = $headers['Authorization'];
if (strpos($authHeader, 'Bearer ') !== 0) return sendResponse(false, "Invalid Authorization format");

$token = substr($authHeader, 7);
$data = new authController();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $quizId = $_GET['quiz_id'] ?? null;
    $data->getQuestions($token, $quizId);
} else {
    if (isset($_POST['quiz_id'], $_POST['text'], $_POST['marks'])) {
        $data->addQuestion($token, $_POST['quiz_id'], $_POST['text'], $_POST['marks']);
    } elseif (isset($_POST['update'])) {
        $data->editQuestion($token, $_POST['update'], $_POST['text'], $_POST['marks']);
    } elseif (isset($_POST['delete'])) {
        $data->deleteQuestion($token, $_POST['delete']);
    } else {
        sendResponse(false, "Invalid request");
    }
}
