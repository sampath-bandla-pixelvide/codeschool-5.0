<?php
session_start();
header("Content-Type: application/json");
require_once(__DIR__."/../utils/functions.php");
require_once "../utils/pdo.php";

if (!isset($_SESSION['user'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}
verifyToken();
$pdo = getPDO();

$quiz_id = $_GET['quiz_id'] ?? 0;
$qstmt = $pdo->prepare("
    SELECT id, question_text 
    FROM questions 
    WHERE quiz_id = :quiz_id
");

$qstmt->execute([':quiz_id' => $quiz_id]);
$questions = $qstmt->fetchAll(PDO::FETCH_ASSOC);
$result = [];
foreach ($questions as $q) {
    $ostmt = $pdo->prepare("
      SELECT id, option_text, is_correct 
FROM options 
WHERE question_id = :qid AND status = 'active'
    ");

    $ostmt->execute([':qid' => $q['id']]);
    $options = $ostmt->fetchAll(PDO::FETCH_ASSOC);
    $result[] = [
        "question_id" => $q['id'],
        "question_text" => $q['question_text'],
        "options" => array_map(function ($opt) {
            return [
                "id" => $opt['id'],
                "text" => $opt['option_text'],
                "is_correct" => $opt['is_correct']
            ];
        }, $options)
    ];
}
echo json_encode($result);