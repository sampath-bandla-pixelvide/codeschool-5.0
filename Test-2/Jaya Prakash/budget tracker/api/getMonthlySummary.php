<?php

require_once __DIR__ . "/controllers/ExpensesControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = getTokenFromHeader();

if (!$token) {
    die(sendResponse(false, "Invalid token"));
}

$month = $_GET['month'];

$expensesController = new ExpensesControllers();
echo $expensesController->getMonthlySummary($token,$month);