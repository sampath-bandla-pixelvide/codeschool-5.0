<?php
require __DIR__.'/../controllers/authController.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}


$token = $_POST["token"];

$auth = new authController();
$auth->authToken($token);