<?php
require_once __DIR__ . "/../controllers/publicController.php";

if ($_SERVER['REQUEST_METHOD'] != 'GET') {
    sendResponse(false, "GET method only");
}

if (!isset($_GET['id'])) {
    sendResponse(false, "Campaign ID is required");
}

$controller = new publicController();
$controller->getCampaignDetails($_GET['id']);
