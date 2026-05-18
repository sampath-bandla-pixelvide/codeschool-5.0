<?php
function loginFormValidations($email, $password)
{
    return (
        filter_var($email,FILTER_VALIDATE_EMAIL) &&
        strlen($password) >= 8 &&
        strlen($password) <= 16
    );
}

function registerFormValidations($first_name, $last_name, $email, $phone, $password, $confirmPassword)
{
    // $mailRegex = "/^[a-zA-Z0-9+-.#$]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/";
    $phoneRegex = "/^[6-9][0-9]{9}$/";
    $errors = [];
    $errorFlag = false;

    if (strlen($first_name) < 4 || strlen($first_name) > 30) {
        $errors['firstNameInput'] = "Invalid First Name!";
        $errorFlag = true;
    }
    if (strlen($last_name) < 4 || strlen($last_name) > 30) {
        $errors['lastNameInput'] = "Invalid Last Name!";
        $errorFlag = true;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['registerEmailInput'] = "Invalid Email!";
        $errorFlag = true;
    }
    if (strlen($phone) != 10 || !is_numeric($phone) || !preg_match($phoneRegex,$phone)) {
        $errors['registerPhoneInput'] = "Invalid phone number!";
        $errorFlag = true;
    }
    if (strlen($password) < 6 || strlen($password) > 20) {
        $errors['registerPasswordInput'] = "Invalid Password!";
        $errorFlag = true;
    }
    if ($password !== $confirmPassword) {
        $errors['registerConfirmPasswordInput'] = "Password Mismatch!";
        $errorFlag = true;
    }
    return $errors;
}
