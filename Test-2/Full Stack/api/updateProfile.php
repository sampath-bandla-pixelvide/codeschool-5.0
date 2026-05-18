<?php

require_once __DIR__ . "/Controllers/UserController.php";

$headers =
    getallheaders();

$token =
    $headers["Authorization"]
    ?? $headers["authorization"]
    ?? "";

$token =
    trim(
        str_replace(
            "Bearer",
            "",
            $token
        )
    );

$full_name =
    $_POST["full_name"] ?? "";

$email =
    $_POST["email"] ?? "";

$phone_number =
    $_POST["phone_number"] ?? "";

$userController =
    new UserController();

echo $userController
    ->updateProfile(
        $token,
        $full_name,
        $email,
        $phone_number
    );