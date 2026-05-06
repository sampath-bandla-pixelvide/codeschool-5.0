<?php
require_once "verifyToken.php";
require_once "utils/db.php";

$user = verifyToken();

if (!$user || $user['role'] !== 'admin') {
    echo json_encode(["status" => "error"]);
    exit;
}

$db = new DB();

$db->query("SELECT require_approval_global FROM settings LIMIT 1");
$data = $db->first();

echo json_encode([
    "status" => "success",
    "require_approval_global" => $data['require_approval_global']
]);