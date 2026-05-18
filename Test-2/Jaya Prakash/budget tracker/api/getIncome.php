<?php

require_once __DIR__ . "/controllers/IncomeControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = getTokenFromHeader();

if (!$token) {
    die(sendResponse(false, "Invalid token. try again later..."));
}

$incomeController = new IncomeControllers();

echo $incomeController->getIncome($token);