<?php
session_start();

require_once __DIR__ . "/controllers/AuthController.php";

$auth = new AuthController();

$response = $auth->getAllPosts();

echo json_encode($response);
