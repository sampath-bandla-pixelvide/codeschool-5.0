<?php
require_once __DIR__ . "/controllers/AdminControllers.php";
require_once __DIR__ . "/utils/functions.php";

$id = $_POST['id'] ?? null;
$token = $_POST['userToken'];

$adminControl = new AdminControllers();
echo $adminControl->deleteCategory($id,$token);