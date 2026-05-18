<?php

require_once("./utils/functions.php");
//require_once("./utils/db.php");
require_once __DIR__ . '/controllers/AuthController.php';

$email = $_POST["email"];
$password = $_POST["password"];

AuthController::validateEmail($email);
AuthController::validatePassword($password);

$auth = new AuthController();
$auth->login($email, $password);