<?php
header("Content-Type: application/json");

require_once "verifyToken.php";
require_once "utils/db.php";

$user = verifyToken();

if (!$user) {
    echo json_encode(["status" => "error"]);
    exit;
}

$db = new DB();

$db->query("
    SELECT course_id 
    FROM enrollment_requests 
    WHERE user_id = :user_id 
    AND status = 'pending'
");

$requests = $db->get([
    ":user_id" => $user['id']
]);

echo json_encode([
    "status" => "success",
    "requests" => $requests
]);