<?php
require_once __DIR__ . "/controllers/ExpensesControllers.php";
require_once __DIR__ . "/utils/functions.php";


$token = getTokenFromHeader();

if (!$token) {
    sendResponse(false, "Token missing");
}

$expensesController = new ExpensesControllers();
echo $expensesController->getMonths($token);