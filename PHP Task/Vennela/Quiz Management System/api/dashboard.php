<?php
session_start();
require_once(__DIR__."/../utils/functions.php");
header("Content-Type: application/json");
require_once "../controllers/DashboardController.php";


verifyToken();
if (!isset($_SESSION['user'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}
$user = $_SESSION['user'];

$controller = new DashboardController();
$data = $controller->getDashboardData();
$data['role'] = $user['role'];
$data['name'] = $user['name'];

echo json_encode($data);