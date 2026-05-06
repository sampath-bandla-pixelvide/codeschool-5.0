<?php
require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');
require_once(__DIR__ . '/../../controllers/QuestionController.php');
 
$user = verifyToken();
checkAdmin($user);
 
$id        = intval($_POST['id']        ?? 0);
$questionText  = trim($_POST['question_text']    ?? '');
$options         = trim($_POST['options']         ?? '');
$options = json_decode($options, true);
// $correctOption = intval($_POST['correct_option'] ?? 0);
 
if (!$id || !$questionText || !$options) {
    sendResponse(false, "All fields are required");
}
 
$controller = new QuestionController();
$controller->updateQuestion($id, $questionText, $options);
 
sendResponse(true, "Question updated successfully");
