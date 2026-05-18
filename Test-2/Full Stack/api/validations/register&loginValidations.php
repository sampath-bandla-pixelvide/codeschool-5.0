<?php

function loginValidations($login_input, $password)
{
    $emailRegex = "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/";
    $phoneRegex = "/^[6-9][0-9]{9}$/";

    return (
        (preg_match($emailRegex, $login_input) || preg_match($phoneRegex, $login_input)) &&
        strlen($password) >= 8 &&
        strlen($password) <= 12
    );
}

function registerValidations($first_name, $last_name, $email, $phone, $dob, $password, $confirmPassword)
{
    $emailRegex = "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/";
    $phoneRegex = "/^[6-9][0-9]{9}$/";
    $passwordRegex = "/^(?=.*[@$!%*?&]).{8,}$/";

    $errors = [];

    if (strlen(trim($first_name)) < 3 || strlen(trim($first_name)) > 20) {
        $errors['first_name'] = "Invalid First Name!";
    }

    if (strlen(trim($last_name)) < 3 || strlen(trim($last_name)) > 20) {
        $errors['last_name'] = "Invalid Last Name!";
    }

    if (!preg_match($emailRegex, $email)) {
        $errors['email'] = "Invalid Email!";
    }

    if (!preg_match($phoneRegex, $phone)) {
        $errors['phone_number'] = "Invalid Phone Number!";
    }

    if (empty($dob)) {
        $errors['date_of_birth'] = "Date Of Birth is required!";
    }

    if (!preg_match($passwordRegex, $password)) {
        $errors['password'] = "Password must contain minimum 8 characters and 1 special character!";
    }

    if ($password !== $confirmPassword) {
        $errors['confirm_password'] = "Passwords do not match!";
    }

    return $errors;
}