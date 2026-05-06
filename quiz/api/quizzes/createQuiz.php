<?php
require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');
require_once(__DIR__ . '/../../controllers/QuizController.php');
 
$user = verifyToken();
checkAdmin($user);
 
$subjectId        = intval($_POST['subject_id']         ?? 0);
$title            = trim($_POST['title']                ?? '');
$durationMins     = intval($_POST['duration_mins']      ?? 0);
 
if (!$subjectId || !$title || !$durationMins) {
    sendResponse(false, "All fields are required");
}
 
$controller = new QuizController();
$quizId     = $controller->createQuiz($subjectId, $title, $durationMins);
 
sendResponse(true, "Quiz created successfully", ['quiz_id' => $quizId]);
