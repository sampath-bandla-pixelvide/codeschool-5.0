<?php

require_once __DIR__ . "/../Controllers/UserController.php";
require_once __DIR__ . "/../Utils/functions.php";

$token =
    getTokenFromHeader();

$full_name =
    trim($_POST["full_name"] ?? "");

$mobile_number =
    trim($_POST["mobile_number"] ?? "");

$purpose =
    trim($_POST["purpose"] ?? "");

$errors = [];

$phoneRegex =
    "/^[6-9][0-9]{9}$/";

if (
    strlen($full_name) < 3 ||
    strlen($full_name) > 50
) {

    $errors["full_name"] =
        "Invalid Full Name!";

}

if (
    !preg_match(
        $phoneRegex,
        $mobile_number
    )
) {

    $errors["mobile_number"] =
        "Invalid Mobile Number!";

}

if (empty($purpose)) {

    $errors["purpose"] =
        "Purpose is required!";

}

if (!empty($errors)) {

    echo sendResponse(
        false,
        "Validation Failed!",
        [],
        $errors
    );

    exit;

}

$userController =
    new UserController();

$response =
    $userController->bookAppointment(
        $token,
        $full_name,
        $mobile_number,
        $purpose
    );

echo $response;