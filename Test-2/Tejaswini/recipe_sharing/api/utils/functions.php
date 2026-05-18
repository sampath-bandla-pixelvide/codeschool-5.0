<?php

function sendResponse($status, $message, $data = [], $errors = [])
{
    echo json_encode([
        "status" => $status,
        "message" => $message,
        "data" => $data,
        "errors" => $errors
    ]);
    exit();
}

function generateUserToken($len = 20)
{
    return bin2hex(random_bytes($len / 2));
}

function getTokenFromHeader()
{
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        return null;
    }

    $authHeader = $headers['Authorization'];

    if (strpos($authHeader, 'Bearer ') !== 0) {
        return null;
    }

    return trim(str_replace('Bearer ', '', $authHeader));
}