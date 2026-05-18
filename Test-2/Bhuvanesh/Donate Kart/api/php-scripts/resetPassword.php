<?php

require_once __DIR__."/../controllers/authController.php";
require_once __DIR__."/../Validations/Validation.php";


if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}


$temp_token = $_POST['token'];
$password = $_POST['password'];
$confirmPassword = $_POST['confirmPassword'];

checkPassword($password,$confirmPassword);

$auth = new authController();
$auth->resetPassword($temp_token,$password);