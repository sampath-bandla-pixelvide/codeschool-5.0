<?php

session_start();

require_once __DIR__ . '/controllers/postController.php';

$controller = new PostController();
$controller->getProfile();