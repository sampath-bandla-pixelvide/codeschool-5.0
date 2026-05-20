<?php

require_once __DIR__ . '/../helpers/JWTHelper.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';

class AuthMiddleware {
    public static function handle() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            ResponseHelper::error("Unauthorized: No token provided", 401);
        }

        $token = $matches[1];
        $decoded = JWTHelper::verifyToken($token);

        if (!$decoded) {
            ResponseHelper::error("Unauthorized: Invalid or expired token", 401);
        }

        return $decoded;
    }
}
