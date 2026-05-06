<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/utils/functions.php";
require_once __DIR__ . "/controllers/AuthController.php";

$token = $_POST['token'] ?? '';
$file = $_FILES['avatar'] ?? null;

$auth = new AuthController();
$auth->uploadAvatar($token, $file);
