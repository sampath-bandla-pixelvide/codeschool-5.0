<?php

require_once(__DIR__ . "/controllers/AuthController.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];

$auth = new AuthController();
$response = $auth->deleteItem($id);

echo json_encode($response);