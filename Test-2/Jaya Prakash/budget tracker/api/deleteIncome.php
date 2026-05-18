<?php

require_once __DIR__ . "/controllers/IncomeControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = getTokenFromHeader();
$id = $_POST['id'] ?? null;

if (!$token) {
    die(sendResponse(false, "Invalid token"));
}

if (!$id) {
    die(sendResponse(false, "Income id required"));
}
$incomeController = new IncomeControllers();
echo $incomeController->deleteIncome($token,$id);
