<?php
require_once __DIR__ . "/controllers/UserControllers.php";

$token = $_POST['userToken'];

$userControl = new UserControllers();
echo $userControl->getUserAddress($token);