<?php

header("Content-Type: application/json");

require_once(__DIR__ . "/database/db.php");


$headers = getallheaders();

if (!isset($headers['Authorization'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Token missing"
    ]);
    exit;
}


$token = str_replace("Bearer ", "", $headers['Authorization']);

$db = new DB();


$db->query("
    UPDATE tokens 
    SET is_valid = false 
    WHERE token = :token
");

$db->update([
    ":token" => $token
]);

echo json_encode([
    "status" => "success",
    "message" => "Logged out successfully"
]);