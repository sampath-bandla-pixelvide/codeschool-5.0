<?php
require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');
require_once(__DIR__ . '/../../controllers/SubjectController.php');
 
$user = verifyToken();
checkAdmin($user);
 
$id   = intval($_POST['id']   ?? 0);
$name = trim($_POST['name']   ?? '');
 
if (!$id || !$name) {
    sendResponse(false, "ID and name are required");
}
 
$controller = new SubjectController();
$controller->updateSubject($id, $name);
 
sendResponse(true, "Subject updated successfully");
