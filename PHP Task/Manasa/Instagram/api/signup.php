<?php
header("Content-Type: application/json");


require_once __DIR__ . "/controllers/AuthController.php";

$auth = new AuthController();

$response = $auth->signup($_POST);

echo json_encode($response);
exit;
