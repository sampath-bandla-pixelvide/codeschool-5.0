<?php

require_once __DIR__ . "/utils/functions.php";
require_once __DIR__ . "/controllers/AuthControllers.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(false, "POST method only");
}

$first_name = $_POST["first_name"] ?? "";
$last_name = $_POST["last_name"] ?? "";
$email = $_POST["email"] ?? "";
$phone = $_POST["phone"] ?? "";
$pan = $_POST["pan"] ?? "";
$dob = $_POST["dob"] ?? "";
$password = $_POST["password"] ?? "";

$auth = new AuthControllers();

$auth->register($first_name,$last_name,$email,$phone,$pan,$dob,$password);