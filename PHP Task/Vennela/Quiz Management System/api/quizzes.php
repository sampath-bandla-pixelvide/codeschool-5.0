<?php
session_start();
header("Content-Type: application/json");
require_once "../utils/pdo.php";
require_once(__DIR__."/../utils/functions.php");

if (!isset($_SESSION['user'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}
$pdo = getPDO();
verifyToken();
$sql = "
SELECT 
    s.id AS subject_id,
    s.name AS subject,
    q.id AS quiz_id,
    q.title,
    q.total_marks
FROM subjects s
LEFT JOIN quizzes q ON q.subject_id = s.id
WHERE s.status = 'active'
ORDER BY s.id
";

$stmt = $pdo->query($sql);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$result = [];
foreach ($data as $row) {
    $sid = $row['subject_id'];
    if (!isset($result[$sid])) {
        $result[$sid] = [
            "subject_id" => $sid,
            "subject" => $row['subject'],
            "quizzes" => []
        ];
    }
    if ($row['quiz_id']) {
        $result[$sid]["quizzes"][] = [
            "id" => $row['quiz_id'],
            "title" => $row['title'],
            "marks" => $row['total_marks']
        ];
    }
}

echo json_encode(array_values($result));