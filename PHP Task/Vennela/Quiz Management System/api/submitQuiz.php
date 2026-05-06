<?php
session_start();
header("Content-Type: application/json");
require_once(__DIR__."/../utils/functions.php");
require_once "../utils/pdo.php";
if (!isset($_SESSION['user'])) {
    echo json_encode([
        "status" => false,
        "message" => "Not logged in"
    ]);
    exit;
}

$pdo = getPDO();
verifyToken();

$user_id = $_SESSION['user']['id'];-
$quiz_id = $_POST['quiz_id'] ?? null;
$answers = $_POST['answers'] ?? null;
if (!$quiz_id || !$answers) {
    echo json_encode([
        "status" => false,
        "message" => "Invalid request"
    ]);
    exit;
}

$answers = json_decode($answers, true);

if (!is_array($answers)) {
    echo json_encode([
        "status" => false,
        "message" => "Invalid answers format"
    ]);
    exit;
}
//checking already completed the quiz or not
$stmt = $pdo->prepare(" 
  SELECT id FROM attempts
  WHERE user_id = ? 
  AND quiz_id = ?
  AND status = 'completed'
  LIMIT 1
");
$stmt->execute([$user_id, $quiz_id]);
if ($stmt->fetch()) {
    echo json_encode([
        "status" => false,
        "message" => "You already attempted this quiz"
    ]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT COUNT(*) 
    FROM questions 
    WHERE quiz_id = ?
");
$stmt->execute([$quiz_id]);
$total = $stmt->fetchColumn();
$score = 0;
foreach ($answers as $question_id => $selected_option) {
    $stmt = $pdo->prepare("
        SELECT is_correct 
        FROM options 
        WHERE id = :opt_id
    ");
    $stmt->execute([':opt_id' => $selected_option]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row && $row['is_correct']) {
        $score++;
    }
}
$stmt = $pdo->prepare("
    INSERT INTO attempts (user_id, quiz_id, score, total, status, submitted_at)
    VALUES (:user_id, :quiz_id, :score, :total, 'completed', CURRENT_TIMESTAMP)
    RETURNING id
");

$stmt->execute([
    ':user_id' => $user_id,
    ':quiz_id' => $quiz_id,
    ':score' => $score,
    ':total' => $total
]);

$attempt_id = $stmt->fetchColumn();
foreach ($answers as $question_id => $selected_option) {

    $stmt = $pdo->prepare("
        INSERT INTO answers (attempt_id, question_id, selected_option)
        VALUES (:attempt_id, :question_id, :selected_option)
    ");

    $stmt->execute([
        ':attempt_id' => $attempt_id,
        ':question_id' => $question_id,
        ':selected_option' => $selected_option
    ]);
}
echo json_encode([
    "status" => true,
    "score" => $score,
    "total" => $total
]);