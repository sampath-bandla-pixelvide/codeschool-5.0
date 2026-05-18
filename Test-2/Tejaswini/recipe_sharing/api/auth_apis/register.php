<?php

require_once __DIR__ . "/../controllers/AuthController.php";
require_once __DIR__ . "/../validations/formValidations.php";
require_once __DIR__ . "/../utils/functions.php";

$profileImage = $_FILES['profileImage'] ?? null;

$firstNameInput = trim($_POST['firstNameInput'] ?? '');
$lastNameInput = trim($_POST['lastNameInput'] ?? '');

$registerEmailInput = trim($_POST['registerEmailInput'] ?? '');

$registerPhoneInput = trim($_POST['registerPhoneInput'] ?? '');

$registerPasswordInput = $_POST['registerPasswordInput'] ?? '';

$registerConfirmPasswordInput =
    $_POST['registerConfirmPasswordInput'] ?? '';

$formValidationsResult = registerFormValidations(
    $firstNameInput,
    $lastNameInput,
    $registerEmailInput,
    $registerPhoneInput,
    $registerPasswordInput,
    $registerConfirmPasswordInput
);

if (!empty($formValidationsResult)) {
    sendResponse(
        false,
        "Register form validations failed",
        [],
        $formValidationsResult
    );
}

$fileName = null;

if ($profileImage && $profileImage['error'] === 0) {

    $fileName = time() . "_" . basename($profileImage['name']);

    $path = __DIR__ . "/../uploads/" . $fileName;

    if (!move_uploaded_file($profileImage['tmp_name'], $path)) {
        sendResponse(false, "File upload failed");
    }
}

$authControl = new AuthController();

$authControl->register(
    $firstNameInput,
    $lastNameInput,
    $registerEmailInput,
    $registerPhoneInput,
    $fileName,
    $registerPasswordInput
);