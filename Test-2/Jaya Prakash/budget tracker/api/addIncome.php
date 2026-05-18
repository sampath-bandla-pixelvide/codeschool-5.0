<?php
require_once __DIR__ . "/controllers/IncomeControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = getTokenFromHeader();
$amount = $_POST['amount'] ?? null;
$incomeDate = $_POST['incomeDate'] ?? null;

if(!$token){
    die(sendResponse(false,"Invalid token.try again later..."));
}

if (!$amount || !$incomeDate) {
    die(sendResponse(false, "All fields required"));
}

$incomeController = new IncomeControllers();

echo $incomeController->addIncome($token,$amount,$incomeDate);
