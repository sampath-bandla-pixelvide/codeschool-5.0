<?php

session_start();

require_once __DIR__ . '/controllers/CommentController.php';

$post_id = $_GET['post_id'] ?? null;

$controller = new CommentController();
$controller->getComments($post_id);