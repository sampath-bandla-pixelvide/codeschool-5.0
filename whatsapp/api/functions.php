<?php
function sendResponse($status,$message='Success',$data=null){
    header('Content-Type: application/json');
    echo json_encode([
        "status"=>$status,
        "message"=>$message,
        "data"=>$data
    ]);
    exit();
}
function generateOTP(){
    return random_int(100000,999999);
}
function generateToken($length=12){
    return bin2hex(random_bytes($length));
}