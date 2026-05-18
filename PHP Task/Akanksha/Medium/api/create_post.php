<?php

session_start(); 

require_once __DIR__ . '/controllers/postController.php';

$title   = $_POST['title'] ?? '';
$content = $_POST['content'] ?? '';

$controller = new PostController();
$controller->createPost($title, $content);