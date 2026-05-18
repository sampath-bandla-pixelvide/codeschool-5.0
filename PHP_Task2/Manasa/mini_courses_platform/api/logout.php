<?php
header("Content-Type: application/json");

require_once __DIR__ . "/utils/db.php";


$headers = getallheaders();

if (!isset($headers['Authorization'])) {
    echo json_encode(["status" => "error", "message" => "Token missing"]);
    exit;
}

$token = str_replace("Bearer ", "", $headers['Authorization']);

$db = new DB();

$db->query("DELETE FROM tokens WHERE token = :token");

$db->delete([
    ":token" => $token
]);

echo json_encode([
    "status" => "success",
    "message" => "Logged out successfully"
]);
