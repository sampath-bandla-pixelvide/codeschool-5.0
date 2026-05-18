<?php

header("Content-Type: application/json");

require_once(__DIR__ . "/controllers/AuthController.php");


$headers = getallheaders();

if (!isset($headers['Authorization'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Token missing"
    ]);
    exit;
}


$token = str_replace("Bearer ", "", $headers['Authorization']);

$auth = new AuthController();
$response = $auth->getUserByToken($token);

echo json_encode($response);