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

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['check_correct'])) {
    $data->checkCorrectOption($token, $_GET['question_id']);
    return;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $qid = $_GET['question_id'] ?? null;
    $data->getOptions($token, $qid);
}
    else {
    if (isset($_POST['question_id'], $_POST['text'], $_POST['is_correct'])) {
        $data->addOption($token, $_POST['question_id'], $_POST['text'], $_POST['is_correct']);
    } elseif (isset($_POST['update'], $_POST['text'], $_POST['is_correct'])) {
        $data->editOption($token, $_POST['update'], $_POST['text'], $_POST['is_correct']);
    } elseif (isset($_POST['delete'])) {
        $data->deleteOption($token, $_POST['delete']);
    } 
    else {
        sendResponse(false, "Invalid request");
    }
}
