<?php

session_start();

require_once __DIR__ . '/controllers/postController.php';
// require_once __DIR__ . '/../utils/functions.php';

$id = $_GET['id'] ?? null;

$controller = new PostController();
$controller->getPostById($id);