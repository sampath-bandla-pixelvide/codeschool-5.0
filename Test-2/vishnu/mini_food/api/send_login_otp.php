<?php
require_once __DIR__ . '/utils/functions.php';
require_once __DIR__ . '/controllers/AuthController.php';

header('Content-Type: application/json');

$ctrl = new AuthController();
$ctrl->sendLoginOtp();
