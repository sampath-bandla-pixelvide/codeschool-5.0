<?php
function sendResponse($status, $message, $errors = [], $data = [])
{
    return json_encode(["status"=>$status, "message"=>$message, "errors"=>$errors, "data"=>$data]);
}

function generateSecureToken($length = 20)
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $token = '';
    for ($i = 0; $i < $length; $i++) {
        $token .= $characters[random_int(0, strlen($characters) - 1)];
    }
    return $token;
}
