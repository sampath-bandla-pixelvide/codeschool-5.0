<?php
require __DIR__.'/../validations/validations.php';
require __DIR__.'/../controllers/authController.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "Invalid method");
}
$email = $_POST["email"];

email($email);

$auth = new authController();
$auth->verifyEmail($email);