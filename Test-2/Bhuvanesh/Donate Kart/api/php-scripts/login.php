<?php

require_once __DIR__."/../Validations/Validation.php";
require_once __DIR__."/../controllers/authController.php";

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}

$email = $_POST['email'];
$password = $_POST['password'];

loginValidation($email,$password);

$auth = new authController();
$auth->login($email,$password);