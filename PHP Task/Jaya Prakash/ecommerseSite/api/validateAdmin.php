<?php
require_once __DIR__ . "/controllers/AdminControllers.php";

$token = $_POST['token'];

$adminControl = new AdminControllers();
echo $adminControl->validateAdmin($token);