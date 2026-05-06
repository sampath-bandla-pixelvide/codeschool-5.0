<?php
require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');
require_once(__DIR__ . '/../../controllers/QuizController.php');
 
$user = verifyToken();
checkAdmin($user);
 
$id               = intval($_POST['id']                 ?? 0);
$subjectId        = intval($_POST['subject_id']         ?? 0);
$title            = trim($_POST['title']                ?? '');
$durationMins     = intval($_POST['duration_mins']      ?? 0);
$marksPerQuestion = intval($_POST['marks_per_question'] ?? 1);
 
if (!$id || !$subjectId || !$title || !$durationMins) {
    sendResponse(false, "All fields are required");
}
 
$controller = new QuizController();
$controller->updateQuiz($id, $subjectId, $title, $durationMins, $marksPerQuestion);
 
sendResponse(true, "Quiz updated successfully");
