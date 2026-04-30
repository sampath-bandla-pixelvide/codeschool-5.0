<?php
require_once("./utils/functions.php");
require_once("./controllers/AuthController.php");

$token = $_POST['token'] ?? '';

$auth = new AuthController();
$auth->deleteAccount($token);
