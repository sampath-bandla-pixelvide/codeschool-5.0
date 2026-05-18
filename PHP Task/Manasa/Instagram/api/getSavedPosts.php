<?php
session_start();
header("Content-Type: application/json");

require_once __DIR__ . "/controllers/AuthController.php";

$auth = new AuthController();

echo json_encode($auth->getSavedPosts());