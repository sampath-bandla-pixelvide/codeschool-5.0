<?php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../helpers/JWTHelper.php';

class AuthService {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function login($email, $password) {
        $user = $this->userModel->findByEmail($email);

        if (!$user || !password_verify($password, $user['password'])) {
            return false;
        }

        if (!$user['is_active']) {
            throw new Exception("Account is deactivated");
        }

        $fullName = trim($user['first_name'] . ' ' . $user['last_name']);

        $payload = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $fullName
        ];

        $token = JWTHelper::generateToken($payload);

        return [
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $fullName,
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ];

    }
}    
