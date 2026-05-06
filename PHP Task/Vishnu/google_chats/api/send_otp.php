<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/utils/functions.php";
require_once __DIR__ . "/controllers/AuthController.php";

$email = trim($_POST["email"] ?? "");

$auth = new AuthController();
$auth->sendOtp($email);
