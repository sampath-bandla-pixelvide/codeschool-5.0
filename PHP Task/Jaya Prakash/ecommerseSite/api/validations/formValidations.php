<?php

define("EMAIL_REGEX", "/^[a-zA-Z0-9.$#]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/");

function loginFormValidations($email, $password)
{
    $errors = [];
    if (!preg_match(EMAIL_REGEX, $email)) {
        $errors['emailInputError'] = "Invalid email!!";
    }
    if (strlen($password) < 6 && strlen($password) > 20) {
        $errors['passwordInputError'] = "Invalid Password";
    }
    if (!empty($errors)) {
        return [
            "status" => false,
            "errors" => $errors
        ];
    }
    return [
        "status" => true
    ];
}
function registerFormValidations($firstName, $lastName, $email, $phone, $password, $confirmPassword)
{
    $firstNameRegex = "/^[A-Za-z]+(?: [A-Za-z]+)*$/";
    $lastNameRegex = "/^[A-Za-z]{2,30}$/";
    $phoneRegex = "/^[6-9]\d{9}$/";
    $errors = [];
    if (!preg_match($firstNameRegex, $firstName)) {
        $errors['firstNameInputError'] = "Invalid first name";
    }
    if (!preg_match($lastNameRegex, $lastName)) {
        $errors['lastNameInputError'] = "Invalid last name";
    }
    if (!preg_match(EMAIL_REGEX, $email)) {
        $errors['registerEmailError'] = "Invalid email";
    }
    if (!preg_match($phoneRegex, $phone)) {
        $errors['phoneInputError'] = "Phone number must be 10 digits";
    }
    if (strlen($password) < 6 || strlen($password) > 20) {
        $errors['registerPasswordError'] = "Password must be between 6 and 20 characters";
    }
    if ($password !== $confirmPassword) {
        $errors['confirmPasswordError'] = "Passwords do not match";
    }

    if (!empty($errors)) {
        return [
            "status" => false,
            "errors" => $errors
        ];
    }

    return [
        "status" => true
    ];
}
