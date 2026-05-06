<?php
require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');
require_once(__DIR__ . '/../../controllers/QuizController.php');
 
$user = verifyToken();
checkAdmin($user);
 
$id = intval($_POST['id'] ?? 0);
 
if (!$id) {
    sendResponse(false, "ID is required");
}
 
$controller = new QuizController();
$controller->deleteQuiz($id);
 
sendResponse(true, "Quiz deleted successfully");
