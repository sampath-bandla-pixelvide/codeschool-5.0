<?php

class RegisterValidation
{
    public function validate($data)
    {
        $errors = [];

        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $password = $data['password'] ?? '';

        if (!$name) {
            $errors['name'] = "Name is required";
        } elseif (strlen($name) < 3) {
            $errors['name'] = "Minimum 3 characters";
        }

        if (!$email) {
            $errors['email'] = "Email required";
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = "Invalid email";
        }

        if (!$phone) {
            $errors['phone'] = "Phone required";
        } elseif (!preg_match("/^[0-9]{10}$/", $phone)) {
            $errors['phone'] = "Invalid phone";
        }

        if (!$password) {
            $errors['password'] = "Password required";
        } elseif (strlen($password) < 6) {
            $errors['password'] = "Min 6 characters";
        }

        return $errors;
    }
}