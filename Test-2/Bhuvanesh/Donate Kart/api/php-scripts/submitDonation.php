<?php
require_once __DIR__ . "/../controllers/publicController.php";

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    sendResponse(false, "Invalid data");
}

$controller = new publicController();
$controller->submitDonation($data);
