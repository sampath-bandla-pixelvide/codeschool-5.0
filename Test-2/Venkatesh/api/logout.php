<?php

require_once __DIR__ . "/utils/functions.php";
require_once __DIR__ . "/controllers/AuthControllers.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(false, "POST method only");
}

$token = $_POST["token"] ?? "";

$auth = new AuthControllers();
$auth->logout($token);