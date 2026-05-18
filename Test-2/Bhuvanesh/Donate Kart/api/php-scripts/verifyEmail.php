<?php

require __DIR__."/../Validations/Validation.php";
require __DIR__."/../controllers/authController.php";

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}

$email = $_POST['email'];

email($email);

$auth = new authController();
$auth->checkEmail($email);
