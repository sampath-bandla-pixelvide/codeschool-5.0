<?php

require_once("./utils/functions.php");
//require_once("./utils/pdo.php");
require_once __DIR__ . '/controllers/AuthController.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}

$first_name = $_POST['firstName'];
$last_name = $_POST['lastName'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$password = $_POST['password'];
$confirmPassword = $_POST['confirmPassword'];

$errorsArray = [];
if (empty($first_name)) {
    $errorsArray["firstName"] = 'First name is required!';
} else {
    if (strlen($first_name) < 3) {
        $errorsArray["firstName"] = "First Name should be atleast 3 characters";
    }
    if (strlen($first_name) > 25) {
        $errorsArray["firstName"] = "First Name should be at most 25 characters";
    }
}

if (empty($last_name)) {
    $errorsArray["lastName"] = "Last Name is required";
}
if (strlen($last_name) < 3) {
    $errorsArray["lastName"] = "Last Name should be atleast 3 characters";
}
if (strlen($last_name) > 25) {
    $errorsArray["lastName"] = "Last Name should be at most 25 characters";
}


if ($password != $confirmPassword) {
    $errorsArray["confirmPassword"] = "Password & Confirm Password doesn't match!";
}

if(!empty($errorsArray)) {
    sendResponse(false, "Please check errors", $errorsArray);
}

$auth = new AuthController();
$auth->register($first_name, $last_name, $email, $phone, $password);
$Auth->isEmailExists($email);


/*$hashedPwd = md5($password);

$insertQuery = "INSERT INTO users
(first_name, last_name, email, phone, password) 
VALUES (:firstName, :lastName, :email, :phone, :password)";

$insertStmt = $pdo->prepare($insertQuery);
$insertStmt->bindParam('firstName', $firstName);
$insertStmt->bindParam('lastName', $lastName);
$insertStmt->bindParam('email', $email);
$insertStmt->bindParam('phone', $phone);
$insertStmt->bindParam('password', $hashedPwd);

$insertData = $insertStmt->execute();
if(!$insertData) {
    sendResponse(false, "Something went wrong during User creation!");
}

sendResponse(true);*/
