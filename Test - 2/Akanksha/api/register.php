<?php

require_once __DIR__ . '/controllers/AuthController.php';

$auth = new AuthController();

$auth->register(
    $_POST['first_name'],
    $_POST['last_name'],
    $_POST['phone_number'],
    $_POST['email'],
    $_POST['password']
);
