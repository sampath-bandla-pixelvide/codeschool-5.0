<?php
header("Content-Type: application/json");

require_once(__DIR__ . "/../config/db.php");
require_once(__DIR__ . "/../config/commonfunctions.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    getResponse(false, "Invalid request method");
}

$token = $_POST['token'] ?? '';

if (!$token) {
    getResponse(false, "Token required");
}

$db = new DB();

$db->query("UPDATE user_tokens SET is_revoked = TRUE WHERE token = :token");
$db->update([":token" => $token]);

getResponse(true, "Logged out successfully");


