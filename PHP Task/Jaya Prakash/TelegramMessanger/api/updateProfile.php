<?php
require_once __DIR__ . "/controllers/AuthControllers.php";

$firstName = $_POST['first_name'];
$lastName = $_POST['last_name'];
$userName = $_POST['user_name'];
$email = $_POST['email'];
$bio = $_POST['bio'];
$token = $_POST['token'];
$file = $_FILES['photo'];

$auth = new AuthControllers();
if (!$file["name"]) {
    die($auth->updateProfileData($token, $firstName, $lastName, $userName, $bio, $email));
}

$uploadTo = "../uploads/";

$fileName = time() . "_" . basename($file["name"]);

$target = $uploadTo . $fileName;

if (!move_uploaded_file($file["tmp_name"], $target)) {
    die(sendResponse(false, "File not Uploaded!!"));
}

echo $auth->updateProfile($token, $firstName, $lastName, $userName, $bio, $fileName, $email);
