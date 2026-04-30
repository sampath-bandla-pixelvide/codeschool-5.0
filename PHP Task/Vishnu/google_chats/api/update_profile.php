<?php
require_once("./utils/functions.php");
require_once("./controllers/AuthController.php");

$token = $_POST['token'] ?? '';
$first_name = $_POST['first_name'] ?? '';
$last_name = $_POST['last_name'] ?? '';

$auth = new AuthController();
$auth->updateProfile($token, $first_name, $last_name);
