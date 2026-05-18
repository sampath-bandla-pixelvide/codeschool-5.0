<?php
require_once __DIR__ . "/../controllers/publicController.php";

if ($_SERVER['REQUEST_METHOD'] != 'GET') {
    sendResponse(false, "GET method only");
}

$controller = new publicController();
$controller->getCampaigns();
