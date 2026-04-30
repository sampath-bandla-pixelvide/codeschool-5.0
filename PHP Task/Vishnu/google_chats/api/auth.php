<?php
require_once("./utils/functions.php");
require_once("./utils/db.php");
require_once __DIR__ . '/controllers/AuthController.php';

$token=$_POST["token"];
$auth = new AuthController();
$auth->validateToken($token);
