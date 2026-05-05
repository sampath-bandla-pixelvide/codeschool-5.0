<?php
function sendResponse($status, $message, $data = [])
{
    return json_encode(["status" => $status, "message" => $message, "data" => $data]);
}

function generateToken($length = 20)
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $token = '';
    for ($i = 0; $i < $length; $i++) {
        $token .= $characters[random_int(0, strlen($characters) - 1)];
    }
    return $token;
}
