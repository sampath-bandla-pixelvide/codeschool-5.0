<?php
session_start();
header("Content-Type: application/json");

require_once "../utils/pdo.php";
require_once(__DIR__."/../utils/functions.php");

$pdo = getPDO();
verifyToken();
$user_id = $_SESSION['user']['id'];

$sql = "
SELECT 
    s.id AS subject_id,
    s.name AS subject,
    q.id AS quiz_id,
    q.title,
    q.total_marks,
    a.id AS attempt_id
FROM subjects s
LEFT JOIN quizzes q ON q.subject_id = s.id
LEFT JOIN attempts a 
  ON a.quiz_id = q.id 
  AND a.user_id = :user_id 
  AND a.status = 'completed'
WHERE s.status = 'active'
ORDER BY s.id
";

$stmt = $pdo->prepare($sql);
$stmt->execute([':user_id' => $user_id]);
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
            "marks" => $row['total_marks'],
            "attempted" => $row['attempt_id'] ? true : false
        ];
    }
}

echo json_encode(array_values($result));