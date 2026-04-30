<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/utils/functions.php";

$firstName = $_POST['first_name'] ?? null;
$lastName = $_POST['last_name'] ?? null;
$userName = $_POST['user_name'] ?? null;
$email = $_POST['email'] ?? null;
$bio = $_POST['bio'] ?? null;
$file = $_FILES['photo'] ?? null;

$phone = $_SESSION['phone'] ?? null;
$rememberMe = $_SESSION['rememberMe'] ?? null;

if (!$file || !$phone || !$userName) {
    die(sendResponse(false,"Validation errors!!"));
}

$uploadTo = "../uploads/";
$fileName = time() . "_" . basename($file["name"]);
$target = $uploadTo . $fileName;

if (!move_uploaded_file($file["tmp_name"],$target)){
    die(sendResponse(false,"File not Uploaded!!"));
}

$auth = new AuthControllers();
echo $auth->register($firstName,$lastName,$userName,$bio,$phone,$fileName,$email,$rememberMe);