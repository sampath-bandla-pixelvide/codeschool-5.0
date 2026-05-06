<?php
require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');
require_once(__DIR__ . '/../../controllers/QuestionController.php');
 
$user = verifyToken();
checkAdmin($user);
$id = intval($_POST['id'] ?? 0);
if (!$id) {
    sendResponse(false, "ID is required");
}
 
$controller = new QuestionController();
$controller->deleteQuestion($id);
 
sendResponse(true, "Question deleted successfully");
