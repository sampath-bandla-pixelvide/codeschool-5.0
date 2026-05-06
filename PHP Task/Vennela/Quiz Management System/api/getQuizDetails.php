<?php
require_once "../utils/pdo.php";
require_once(__DIR__."/../utils/functions.php");

$pdo = getPDO();
verifyToken();
$quiz_id = $_GET['quiz_id'];
$stmt = $pdo->prepare("SELECT title FROM quizzes WHERE id = :id");
$stmt->execute([":id" => $quiz_id]);
$quiz = $stmt->fetch();
$stmt = $pdo->prepare("
SELECT q.id, q.question_text
FROM questions q WHERE q.quiz_id = :id
");
$stmt->execute([":id" => $quiz_id]);
$questions = $stmt->fetchAll();
foreach ($questions as &$q) {
    $stmt = $pdo->prepare("
        SELECT id, option_text, is_correct
        FROM options WHERE question_id = :qid
    ");
    $stmt->execute([":qid" => $q['id']]);
    $opts = $stmt->fetchAll();
    $q['options'] = $opts;
    foreach ($opts as $i => $o) {
        if ($o['is_correct']) {
            $q['correct'] = $i;
        }
    }
}

echo json_encode([
    "title" => $quiz['title'],
    "questions" => $questions
]);