<?php
require __DIR__.'/../controllers/authController.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}

$video_id = $_POST["video_id"];
$token = $_POST["token"];
$comment = $_POST["comment"];

$auth = new authController();
$auth->comments($token,$comment,$video_id);