<?php

function sendResponse($status, $message, $data = [], $errors = [])
{
    return json_encode(["status" => $status, "message" => $message, "data" => $data, "errors" => $errors]);
}

function generateUserToken($len = 20)
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $token = '';
    for ($i = 0; $i < $len; $i++) {
        $token .= $characters[random_int(0, strlen($characters) - 1)];
    }
    return $token;
}

function getTokenFromHeader()
{
    $header = getallheaders();
    return $header['Authentication'];
}
