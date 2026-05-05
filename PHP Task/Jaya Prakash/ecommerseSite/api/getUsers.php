<?php
require_once __DIR__ . "/controllers/AdminControllers.php";

$token = $_POST['userToken'];

$adminControl = new AdminControllers();
echo $adminControl->getUsers($token);