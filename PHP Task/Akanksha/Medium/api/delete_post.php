<?php

session_start();

require_once __DIR__ . '/controllers/postController.php';

$id = $_POST['id'];


$controller = new PostController();
$controller->deletePost($id);