<?php
session_start();
require_once "../utils/pdo.php";
require_once(__DIR__."/../utils/functions.php");
verifyToken();
if (!isset($_SESSION['user'])) {
    echo json_encode([
        "status" => false,
        "message" => "Not logged in"
    ]);
    exit;
}

$pdo = getPDO();
$user_id = $_SESSION['user']['id'];
$total = $pdo->query("SELECT COUNT(*) FROM quizzes")->fetchColumn();
$stmt = $pdo->prepare("SELECT COUNT(*) FROM attempts WHERE user_id = ?");
$stmt->execute([$user_id]);
$completed = $stmt->fetchColumn();
$stmt = $pdo->prepare("
  SELECT AVG(score * 100.0 / NULLIF(total, 0))
FROM attempts
WHERE user_id = ?
AND status = 'completed';
");
$stmt->execute([$user_id]);
$avg = round($stmt->fetchColumn() ?: 0);
$stmt = $pdo->prepare("
  SELECT q.title, ur.score, ur.total AS total, 
         s.name AS subject, ur.created_at
  FROM attempts ur
  JOIN quizzes q ON q.id = ur.quiz_id
  JOIN subjects s ON s.id = q.subject_id
  WHERE ur.user_id = ?
  ORDER BY ur.created_at DESC
");
$stmt->execute([$user_id]);
$attempts = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode([
  "status" => true,
  "total" => $total,
  "completed" => $completed,
  "avg" => $avg,
  "attempts" => $attempts
]);