<?php
require_once("./utils/functions.php");
require_once("./utils/db.php");
require_once __DIR__ . '/controllers/AuthController.php';

$token = $_POST['token'] ?? '';
if (!$token) sendResponse(false, "Token required");

$auth = new AuthController();
$auth->logout($token);
