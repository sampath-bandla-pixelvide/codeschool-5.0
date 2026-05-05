<?php


require_once("./utils/functions.php");
require_once __DIR__ . "/controllers/dashboardController.php";

$dashboard = new dashboardController();

$data = $dashboard->getStats();


sendResponse(true,"Stats",$data);