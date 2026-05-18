<?php

class LoginValidation
{
    public function validate($data)
    {
        $errors = [];

        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$email) {
            $errors['email'] = "Email is required";
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = "Invalid email format";
        }

        if (!$password) {
            $errors['password'] = "Password is required";
        }

        return $errors;
    }
}