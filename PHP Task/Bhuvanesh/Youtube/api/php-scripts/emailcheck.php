<?php
require __DIR__.'/../validation/checks.php';
require __DIR__.'/../controllers/authController.php';

$email = $_POST["email"];

email($email);

$auth = new authController();
$auth->checkEmail($email);