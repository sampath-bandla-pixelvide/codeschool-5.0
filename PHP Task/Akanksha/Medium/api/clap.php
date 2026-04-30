<?php
session_start();

require_once __DIR__ . '/controllers/postController.php';

$controller = new PostController();

$user_id = $_SESSION['user_id'];
$post_id = $_POST['post_id'];

$controller->addClap($user_id, $post_id);

