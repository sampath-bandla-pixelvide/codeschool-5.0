<?php

require_once __DIR__ . '/../helpers/ResponseHelper.php';

class RoleMiddleware {
    public static function check($user, $allowedRoles) {
        if (!isset($user['role']) || !in_array($user['role'], $allowedRoles)) {
            ResponseHelper::error("Forbidden: You do not have permission to access this resource", 403);
        }
    }

    public static function isAdmin($user) {
        self::check($user, ['admin']);
    }

    public static function isEmployee($user) {
        self::check($user, ['admin', 'employee']);
    }
}
