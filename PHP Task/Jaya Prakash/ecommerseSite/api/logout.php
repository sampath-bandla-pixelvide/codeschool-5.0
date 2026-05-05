<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = $_POST['userToken'];
$authControl = new AuthControllers();
echo $authControl->logout($token);