<?php
require_once "verifyToken.php";
require_once "utils/db.php";

$user = verifyToken();

if (!$user || $user['role'] !== 'admin') {
    echo json_encode(["status" => "error"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$db = new DB();

$db->query("UPDATE settings SET require_approval_global = :val");

$db->update([
    ":val" => $data['require_approval_global']
]);

echo json_encode(["status" => "success"]);