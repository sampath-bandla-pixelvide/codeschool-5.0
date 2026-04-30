<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/utils/functions.php";
require_once __DIR__ . "/controllers/AuthController.php";

$email      = trim($_POST["email"]      ?? "");
$first_name = trim($_POST["first_name"] ?? "");
$last_name  = trim($_POST["last_name"]  ?? "");

$auth = new AuthController();
$auth->completeRegister($email, $first_name, $last_name);
