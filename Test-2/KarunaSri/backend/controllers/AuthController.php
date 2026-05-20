<?php

require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';
require_once __DIR__ . '/../utils/Validator.php';

class AuthController {
    private $authService;

    public function __construct() {
        $this->authService = new AuthService();
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        Validator::validate($data, [
            'email' => 'required|email',
            'password' => 'required|min:6'
        ]);

        try {
            $result = $this->authService->login($data['email'], $data['password']);
            if ($result) {
                ResponseHelper::success("Login successful", $result);
            } else {
                ResponseHelper::error("Invalid email or password", 401);
            }
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), 401);
        }
    }
}
