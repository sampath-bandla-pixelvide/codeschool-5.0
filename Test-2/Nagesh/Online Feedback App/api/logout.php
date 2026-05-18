<?php

require_once __DIR__ . "/../controllers/AuthController.php";

$token = $_POST["token"];

$obj = new AuthController();
$obj->logout($token);
 