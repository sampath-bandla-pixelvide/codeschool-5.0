<?php
require_once(__DIR__ . "/../controllers/AuthController.php");
require_once(__DIR__ . "/../config/commonfunctions.php");

header("Content-Type: application/json");

$auth = new AuthController();
$token = $_GET['token'] ?? '';
$user = $auth->validateToken($token);

getResponse(true, "User fetched", [
    "id" => $user['id'],
    "name" => $user['first_name'] . ' ' . $user['last_name'],
    "first_name" => $user['first_name'],
    "last_name" => $user['last_name'],
    "email" => $user['email']
]);
