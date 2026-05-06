<?php

session_start();

require_once __DIR__ . '/controllers/postController.php';

$id = $_GET['id'];

$controller = new PostController();
$controller->getPost($id);