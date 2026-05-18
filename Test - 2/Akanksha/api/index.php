<?php

require_once __DIR__ . '/controllers/AuthController.php';

$auth = new AuthController();

$email = $_POST['email'] ?? null;
$password = $_POST['password'] ?? null;

$auth->login($email, $password);
