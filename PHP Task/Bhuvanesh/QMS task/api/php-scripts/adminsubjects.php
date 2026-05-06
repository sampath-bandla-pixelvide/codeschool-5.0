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
    $data->getSubjects($token);
} else {
    if (isset($_POST['delete'])) {
        $data->deleteSubject($token, $_POST['delete']);
    }
    elseif(isset($_POST['update'])){
    $data->editSubjects($token,$_POST['name'],$_POST['update']);
}elseif (isset($_POST['name'])) {
        $data->addSubject($token, $_POST['name']);
    } 
    else {
        sendResponse(false, "Invalid request");
    }
}
