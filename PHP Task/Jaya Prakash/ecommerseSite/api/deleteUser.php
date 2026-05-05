<?php
require_once __DIR__ . "/controllers/AdminControllers.php";

$token = $_POST['userToken'];
$id = $_POST['id'];

$adminControl = new AdminControllers();
echo $adminControl->deleteUser($id,$token);