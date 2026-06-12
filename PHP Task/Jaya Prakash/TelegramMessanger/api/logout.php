<?php
require_once __DIR__ . "/controllers/AuthControllers.php";

$token = $_POST['userToken'] ?? null;

$auth = new AuthControllers();
echo $auth->logout($token);
