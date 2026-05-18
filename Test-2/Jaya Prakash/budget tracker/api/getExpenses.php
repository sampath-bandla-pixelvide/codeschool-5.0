<?php

require_once __DIR__ . "/controllers/ExpensesControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = getTokenFromHeader();

if (!$token) {
    die(sendResponse(false, "Invalid token"));
}

$month = $_GET['month'] ?? "All";
$categoryId = $_GET['categoryId'] ?? "All";

$expensesController = new ExpensesControllers();
echo $expensesController->getExpenses($token,$month,$categoryId);
