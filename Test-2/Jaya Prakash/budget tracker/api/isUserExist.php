<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/utils/functions.php";

$email = $_POST['emailInput'] ?? null;
$phone = $_POST['phoneInput'] ?? null;

$authControl = new AuthControllers();
echo $authControl->isUserExist($email,$phone);
