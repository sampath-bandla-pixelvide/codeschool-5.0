<?php
require_once __DIR__ . "/controllers/AdminControllers.php";
require_once __DIR__ . "/utils/functions.php";

$categoryName = $_POST['name'];
$token = $_POST['userToken'];

$adminControl = new AdminControllers();
echo $adminControl->addCategory($token,$categoryName);
