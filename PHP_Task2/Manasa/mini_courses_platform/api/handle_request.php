<?php
header("Content-Type: application/json");

require_once "verifyToken.php";
require_once "utils/db.php";

$user = verifyToken();

if (!$user || $user['role'] !== 'admin') {
    echo json_encode(["status" => "error"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$request_id = $data['request_id'] ?? null;
$action = $data['action'] ?? null; // approve / reject

if (!$request_id || !$action) {
    echo json_encode(["status" => "error"]);
    exit;
}

$db = new DB();

// 👉 Get request details
$db->query("SELECT * FROM enrollment_requests WHERE id = :id");
$request = $db->first([":id" => $request_id]);

if (!$request) {
    echo json_encode(["status" => "error", "message" => "Not found"]);
    exit;
}

// ✅ APPROVE
if ($action === "approve") {

    // Insert into enrollments
    $db->query("
        INSERT INTO enrollments (user_id, course_id)
        VALUES (:user_id, :course_id)
    ");

    $db->create([
        ":user_id" => $request['user_id'],
        ":course_id" => $request['course_id']
    ]);

    // Update request status
    $db->query("
        UPDATE enrollment_requests
        SET status = 'approved'
        WHERE id = :id
    ");

    $db->update([":id" => $request_id]);

    echo json_encode(["status" => "approved"]);
    exit;
}


if ($action === "reject") {

    $db->query("
        UPDATE enrollment_requests
        SET status = 'rejected'
        WHERE id = :id
    ");

    $db->update([":id" => $request_id]);

    echo json_encode(["status" => "rejected"]);
    exit;
}