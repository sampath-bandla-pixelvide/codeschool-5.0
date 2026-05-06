<?php

require_once __DIR__ . "/utils/db.php";

function verifyToken()
{
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        return null;
    }

    $token = str_replace("Bearer ", "", $headers['Authorization']);

    if (!$token) {
        return null;
    }

    $db = new DB();

    $db->query("
        SELECT users.* 
        FROM tokens 
        JOIN users ON tokens.user_id = users.id
        WHERE tokens.token = :token
    ");

    $user = $db->first([
        ":token" => $token
    ]);

    return $user ? $user : null;
}
