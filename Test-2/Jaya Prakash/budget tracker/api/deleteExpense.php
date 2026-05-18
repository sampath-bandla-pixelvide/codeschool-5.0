<?php
require_once __DIR__ . "/controllers/ExpensesControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = getTokenFromHeader();

if(!$token){
    die(sendResponse(false,"Unauthorized User"));
}

$expenses_id = $_POST['id'];

$expensesController = new ExpensesControllers();
echo $expensesController->deleteExpense($token,$expenses_id);