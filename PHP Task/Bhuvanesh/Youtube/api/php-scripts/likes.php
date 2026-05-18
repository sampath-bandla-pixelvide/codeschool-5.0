<?php
require __DIR__.'/../controllers/authController.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}

$video_id = $_POST["video_id"];
$token = $_POST["token"];
$liked = $_POST["liked"];

$auth = new authController();
$auth->likes($token,$liked,$video_id);