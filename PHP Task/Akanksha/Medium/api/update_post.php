<?php

session_start();

require_once __DIR__ . '/controllers/postController.php';

$id = $_POST['id'];
$title = $_POST['title'];
$content = $_POST['content'];


$controller = new PostController();
$controller->updatePost($id, $title, $content);