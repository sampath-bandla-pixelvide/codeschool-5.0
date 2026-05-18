<?php

header("Content-Type: application/json");

require_once(__DIR__ . "/controllers/AuthController.php");

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'] ?? '';

$auth = new AuthController();
$response = $auth->resendOtp($email);

echo json_encode($response);