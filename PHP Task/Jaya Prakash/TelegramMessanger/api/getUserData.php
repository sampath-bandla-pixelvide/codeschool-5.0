<?php
require_once __DIR__ . "/controllers/AuthControllers.php";

$token = $_POST['userToken'];

$auth = new AuthControllers();
echo $auth->getUserData($token);