<?php
session_start();
header("Content-Type: application/json");

require_once "../controllers/AuthController.php";


if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => false,
        "message" => "Not logged in"
    ]);
    exit;
}

$userId = $_SESSION['user_id'];


$user = getUserProfile($userId);

if ($user) {

 
    if (!empty($user['profile_pic'])) {
        $user['profile_pic'] = "uploads/profile/" . $user['profile_pic'];
    } else {
        $user['profile_pic'] = ""; 
    }

    echo json_encode([
        "status" => true,
        "user" => $user
    ]);

} else {
    echo json_encode([
        "status" => false,
        "message" => "User not found"
    ]);
}