<?php
require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');
require_once(__DIR__ . '/../../controllers/SubjectController.php');
 
$user = verifyToken();
checkAdmin($user);
 
$id = intval($_POST['id'] ?? 0);
 
if (!$id) {
    sendResponse(false, "ID is required");
}
 
$controller = new SubjectController();
$result     = $controller->deleteSubject($id);
 
if ($result['blocked']) {
    sendResponse(false, $result['message']);
}
 
sendResponse(true, "Subject deleted successfully");
