<?php
require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');
require_once(__DIR__ . '/../../controllers/SubjectController.php');
 
$user = verifyToken();
checkAdmin($user);
 
$name = trim($_POST['name'] ?? '');
 
if (!$name) {
    sendResponse(false, "Subject name is required");
}
$controller = new SubjectController();
$controller->create($name);
sendResponse(true, "Subject created successfully");
