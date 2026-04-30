<?php

session_start();

require_once __DIR__ . '/controllers/commentController.php';

$post_id = $_POST['post_id'] ?? null;
$comment = $_POST['comment'] ?? null;

$controller = new CommentController();
$controller->addComment($post_id, $comment);