<?php
require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');
require_once(__DIR__ . '/../../controllers/SubjectController.php');
 
$user   = verifyToken();
$search = $_GET['search'] ?? '';
 
$controller = new SubjectController();
$subjects   = $controller->getSubjects($search);
 
sendResponse(true, "Success", $subjects);
