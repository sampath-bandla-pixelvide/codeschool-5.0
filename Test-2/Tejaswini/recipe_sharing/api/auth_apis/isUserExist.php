<?php

require_once __DIR__ . "/../controllers/AuthController.php";
require_once __DIR__ . "/../utils/functions.php";

$email = trim($_POST['emailInput'] ?? '');
$phone = trim($_POST['phoneInput'] ?? '');

$authControl = new AuthController();
$authControl->isUserExist($email, $phone);