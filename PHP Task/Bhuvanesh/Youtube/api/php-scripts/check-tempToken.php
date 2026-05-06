<?php
require __DIR__.'/../controllers/authController.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}


$temp_token = $_POST["temp_token"];

$auth = new authController();
$auth->auth_tempToken($temp_token);