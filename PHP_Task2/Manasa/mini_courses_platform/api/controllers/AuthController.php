<?php

require_once __DIR__ . '/../utils/db.php';
require_once __DIR__ . '/../php_validations/RegisterValidation.php';
require_once __DIR__ . '/../php_validations/LoginValidation.php';

class AuthController
{
    private $db;

    public function __construct()
    {
        $this->db = new DB();
    }

    public function signup($data)
    {
        $validator = new RegisterValidation();
        $errors = $validator->validate($data);

        if (!empty($errors)) {
            return [
                "status" => "error",
                "errors" => $errors
            ];
        }

        $name = trim($data['name']);
        $email = trim($data['email']);
        $phone = trim($data['phone']);
        $password = $data['password'];

        $this->db->query("SELECT id FROM users WHERE email = :email OR phone = :phone");

        $user = $this->db->first([
            ":email" => $email,
            ":phone" => $phone
        ]);

        if ($user) {
            return [
                "status" => "error",
                "message" => "User already exists"
            ];
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $this->db->query("
            INSERT INTO users (name, email, phone, password, role)
            VALUES (:name, :email, :phone, :password, :role)
        ");

        $this->db->create([
            ":name" => $name,
            ":email" => $email,
            ":phone" => $phone,
            ":password" => $hashedPassword,
            ":role" => "student"
        ]);

        return [
            "status" => "success"
        ];
    }

    public function Login($data)
    {
        $validator = new LoginValidation();
        $errors = $validator->validate($data);

        if (!empty($errors)) {
            return [
                "status" => "error",
                "errors" => $errors
            ];
        }
        $email = trim($data['email']);
        $password = trim($data['password']);
        $this->db->query("SELECT * FROM users WHERE email = :email");

        $user = $this->db->first([
            ":email" => $email
        ]);

        if (!$user) {
            return [
                "status" => "error",
                "message" => "User not found"
            ];
        }


        if (!password_verify($password, $user['password'])) {
            return [
                "status" => "error",
                "message" => "Invalid password"
            ];
        }

        $token = bin2hex(random_bytes(32));


        $this->db->query("
    INSERT INTO tokens (user_id, token)
    VALUES (:user_id, :token)
");

        $this->db->create([
            ":user_id" => $user['id'],
            ":token" => $token
        ]);


        return [
            "status" => "success",
            "token" => $token,
            "user" => [
                "id" => $user['id'],
                "name" => $user['name'],
                "role" => $user['role']
            ]
        ];
    }
}
