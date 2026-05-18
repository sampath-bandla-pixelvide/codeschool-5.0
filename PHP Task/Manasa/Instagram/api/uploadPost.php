<?php
session_start();

header('Content-Type: application/json');

require_once __DIR__ . "/controllers/AuthController.php";

$auth = new AuthController();

$response = $auth->uploadPost($_FILES);

echo json_encode($response);
exit;