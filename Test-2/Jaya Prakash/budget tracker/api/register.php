<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/validations/formValidations.php";

$profileImage = $_FILES['profileImage'] ?? null;
$firstNameInput = $_POST['firstNameInput'] ?? null;
$lastNameInput = $_POST['lastNameInput'] ?? null;
$registerEmailInput = $_POST['registerEmailInput'] ?? null;
$registerPhoneInput = $_POST['registerPhoneInput'] ?? null;
$registerPasswordInput = $_POST['registerPasswordInput'] ?? null;
$registerConfirmPasswordInput = $_POST['registerConfirmPasswordInput'] ?? null;

$formValidationsResult = registerFormValidations($firstNameInput, $lastNameInput, $registerEmailInput, $registerPhoneInput, $registerPasswordInput, $registerConfirmPasswordInput);

if (!empty($formValidationsResult)) {
    return sendResponse(false, "form validations failed", [], $formValidationsResult);
}

$fileName = null;
if (isset($profileImage['name']) && !empty($profileImage['name'])) {
    $fileName = time() . "_" . basename($profileImage['name']);

    $path = "../uploads/" . $fileName;

    if (!move_uploaded_file($profileImage['tmp_name'], $path)) {
        sendResponse(false, "File not uploaded!!");
    }
}

$authControl = new AuthControllers();
echo $authControl->register($firstNameInput, $lastNameInput, $registerEmailInput, $registerPhoneInput, $fileName, $registerPasswordInput);
