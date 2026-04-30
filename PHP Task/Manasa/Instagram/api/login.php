<?php
session_start();
header("Content-Type: application/json");

require_once __DIR__ . "/controllers/AuthController.php";

$auth = new AuthController();

$response = $auth->login($_POST);

session_write_close();

echo json_encode($response);
exit;
