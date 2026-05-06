<?php
header("Content-Type: application/json");

require_once "verifyToken.php";
require_once "utils/db.php";

$user = verifyToken();

if (!$user) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$course_id = $data['course_id'] ?? null;
$user_id = $user['id'];

if (!$course_id) {
    echo json_encode(["status" => "error", "message" => "Course ID required"]);
    exit;
}

$db = new DB();

try {

   
    $db->query("SELECT * FROM enrollments WHERE user_id = :u AND course_id = :c");
    $exists = $db->first([
        ":u" => $user_id,
        ":c" => $course_id
    ]);

    if ($exists) {
        echo json_encode(["status" => "error", "message" => "Already enrolled"]);
        exit;
    }

   
    $db->query("SELECT * FROM enrollment_requests WHERE user_id = :u AND course_id = :c");
    $req = $db->first([
        ":u" => $user_id,
        ":c" => $course_id
    ]);

    if ($req) {
        echo json_encode(["status" => "pending", "message" => "Already requested"]);
        exit;
    }


    $db->query("SELECT requires_approval FROM courses WHERE id = :id");
    $course = $db->first([":id" => $course_id]);

    $db->query("SELECT require_approval_global FROM settings LIMIT 1");
    $global = $db->first();

    $needsApproval = ($course['requires_approval'] == 1 || $global['require_approval_global'] == 1);

    
    if ($needsApproval) {

        
        $db->query("
            INSERT INTO enrollment_requests (user_id, course_id, status)
            VALUES (:u, :c, 'pending')
        ");

        $db->create([
            ":u" => $user_id,
            ":c" => $course_id
        ]);

        echo json_encode(["status" => "pending"]);
        exit;

    } else {

       
        $db->query("
            INSERT INTO enrollments (user_id, course_id)
            VALUES (:u, :c)
        ");

        $db->create([
            ":u" => $user_id,
            ":c" => $course_id
        ]);

        echo json_encode(["status" => "success"]);
        exit;
    }

} catch (PDOException $e) {

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}