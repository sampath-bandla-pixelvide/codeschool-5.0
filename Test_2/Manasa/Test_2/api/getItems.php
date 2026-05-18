<?php

require_once(__DIR__ . "/controllers/AuthController.php");

$data = json_decode(file_get_contents("php://input"), true);

$role = $data['role'];

$auth = new AuthController();
$response = $auth->getItems($role);

echo json_encode($response);