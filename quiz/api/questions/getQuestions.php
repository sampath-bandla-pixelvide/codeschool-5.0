<?php
require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');
require_once(__DIR__ . '/../../controllers/QuestionController.php');
 
$user   = verifyToken();
// checkAdmin($user);
 
$quizId = intval($_GET['quiz_id'] ?? 0);
 
if (!$quizId) {
    sendResponse(false, "quiz_id is required");
}
 
$controller = new QuestionController();
$questions  = $controller->getQuestions($quizId);
 
sendResponse(true, "Success", $questions['data']);
