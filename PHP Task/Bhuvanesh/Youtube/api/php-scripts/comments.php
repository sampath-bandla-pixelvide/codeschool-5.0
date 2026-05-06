<?php
require __DIR__.'/../controllers/authController.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}

$video_id = $_POST["video_id"];


$auth = new authController();
$auth->display_comments($video_id);