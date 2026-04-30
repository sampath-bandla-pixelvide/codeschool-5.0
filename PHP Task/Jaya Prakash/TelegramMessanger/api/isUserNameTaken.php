<?php
require_once __DIR__ . "/controllers/AuthControllers.php";

$userName = $_GET['user_name'];
//validate

$auth = new AuthControllers();
echo $auth->isUserNameTaken($userName);