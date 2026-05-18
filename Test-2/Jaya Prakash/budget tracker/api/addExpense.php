<?php

require_once __DIR__ . "/controllers/ExpensesControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = getTokenFromHeader();

if (!$token) {
    die(sendResponse(false, "Invalid token"));
}

$categoryId = $_POST['categoryId'] ?? null;
$title = trim($_POST['title'] ?? "");
$description = trim($_POST['description'] ?? "");
$amountSpent = $_POST['amountSpent'] ?? null;
$spentDate = $_POST['spentDate'] ?? null;

if (
    !$categoryId ||
    empty($title) ||
    empty($description) ||
    !$amountSpent ||
    !$spentDate
) {
    die(sendResponse(false, "All fields are required"));
}

if (strlen($title) > 30) {
    die(sendResponse(false, "Title too long"));
}

if ($amountSpent <= 0) {
    die(sendResponse(false, "Invalid amount"));
}

$expensesController = new ExpensesControllers();
echo $expensesController->addExpense($token, $categoryId, $title, $description, $amountSpent, $spentDate);
