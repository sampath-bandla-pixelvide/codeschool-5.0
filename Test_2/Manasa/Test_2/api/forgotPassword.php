<?php

header("Content-Type: application/json");

require_once(__DIR__ . "/controllers/AuthController.php");

$data = json_decode(file_get_contents("php://input"), true);

$auth = new AuthController();
$response = $auth->sendOtp($data);

echo json_encode($response);