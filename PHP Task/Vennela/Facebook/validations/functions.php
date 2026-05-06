<?php

function validateName($first, $last) {
    if (empty($first) || empty($last)) {
        return "Full name is required";
    }
    if (!preg_match("/^[a-zA-Z ]+$/", $first) || !preg_match("/^[a-zA-Z ]+$/", $last)) {
        return "Name must contain only letters";
    }
    return null;
}

function validateDOB($day, $month, $year) {
    if (!$day || !$month || !$year) {
        return "Date of birth is required";
    }

    if (!checkdate((int)$month, (int)$day, (int)$year)) {
        return "Invalid date";
    }

    $dob = "$year-$month-$day";
    $age = date_diff(date_create($dob), date_create('today'))->y;

    if ($age < 13) {
        return "You must be at least 13 years old";
    }

    return null;
}

function validateGender($gender) {
    $allowed = ["Male", "Female", "Custom"];
    if (!in_array($gender, $allowed)) {
        return "Invalid gender selected";
    }
    return null;
}

function validateContact($contact, &$email, &$mobile) {
    if (empty($contact)) {
        return "Email or mobile is required";
    }

    if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
        $email = strtolower($contact);
        $mobile = null;
    } 
    elseif (preg_match("/^[0-9]{10}$/", $contact)) {
        $mobile = $contact;
        $email = null;
    } 
    else {
        return "Enter valid email or 10-digit mobile number";
    }

    return null;
}

function validatePassword($password) {
    if (empty($password)) {
        return "Password is required";
    }
    if (strlen($password) < 6) {
        return "Password must be at least 6 characters";
    }
    return null;
}