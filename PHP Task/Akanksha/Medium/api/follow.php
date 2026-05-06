<?php

session_start();

require_once __DIR__ . '/controllers/followController.php';

$controller = new FollowController();
$controller->toggleFollow($_POST['following_id'] ?? null);