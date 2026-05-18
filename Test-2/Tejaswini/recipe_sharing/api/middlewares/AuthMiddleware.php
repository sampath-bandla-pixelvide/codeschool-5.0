<?php

require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";

function verifyToken()
{
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        sendResponse(false, "Unauthorized");
    }

    $authHeader = $headers['Authorization'];

    if (
        !preg_match(
            '/Bearer\s(\S+)/',
            $authHeader,
            $matches
        )
    ) {
        sendResponse(false, "Invalid token format");
    }

    $token = $matches[1];

    $db = new DB();

    $session = $db
        ->query("
            SELECT
                ut.id as token_id,
                ut.token,
                ut.expires_at,
                ut.status,

                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.role,
                u.photo

            FROM user_tokens ut

            INNER JOIN users u
            ON u.id = ut.user_id

            WHERE ut.token = :token
            AND ut.status = true

            LIMIT 1
        ")
        ->first([
            ":token" => $token
        ]);

    if (!$session) {
        sendResponse(false, "Invalid token");
    }

    if (
        $session['expires_at'] &&
        strtotime($session['expires_at']) < time()
    ) {
        sendResponse(false, "Session expired");
    }
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['user'] = [
        "id" => $session['user_id'],
        "name" => $session['first_name']." ".$session['last_name'],
        "email" => $session['email'],
        "role" => $session['role'],
        "photo" => $session['photo']
    ];
    return;
}