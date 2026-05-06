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
    $subject = $_GET['subject'] ?? "";
    $data->getQuizzes($token, $subject);
} else {
    if (isset($_POST['delete'])) {
        $data->deleteQuiz($token, $_POST['delete']);
    }
    elseif (isset($_POST['update'])) {
        $data->editQuiz(
            $token,
            $_POST['update'],       
            $_POST['title'],        
            $_POST['duration'],     
            $_POST['marks']         
        );
    }
    elseif (isset($_POST['title'])) {
        $data->addQuiz(
            $token,
            $_POST['title'],
            $_POST['duration'],
            $_POST['marks'],
            $_POST['subject']
        );
    }
    else {
        sendResponse(false, "Invalid request");
    }
}
