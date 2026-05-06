<?php

require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../functions.php";

function verifyToken()
{
    $headers = getallheaders();

    // 1. Check header exists
    if (!isset($headers['Authorization'])) {
        sendResponse(false, "Authorization header missing");
    }

    $authHeader = $headers['Authorization'];

    // 2. Validate format: Bearer TOKEN
    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        sendResponse(false, "Invalid token format");
    }

    $token = $matches[1];

    if (!$token) {
        sendResponse(false, "Token missing");
    }

    $db = new DB();

    // 3. Find session
    $db->query("
        SELECT * FROM sessions 
        WHERE token_hash = :token 
        LIMIT 1
    ");
    $session = $db->first(['token' => $token]);

    if (!$session) {
        sendResponse(false, "Invalid token");
    }

    // 4. Check expiry
    if ($session['expires_at'] && strtotime($session['expires_at']) < time()) {
        sendResponse(false, "Session expired");
    }

    // 5. Get user
    $db->query("SELECT * FROM users WHERE id = :id LIMIT 1");
    $user = $db->first(['id' => $session['user_id']]);

    if (!$user) {
        sendResponse(false, "User not found");
    }

    // 6. Remove sensitive fields
    unset($user['password_hash']);

    return $user; // return full user
}