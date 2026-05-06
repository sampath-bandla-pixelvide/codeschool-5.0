<?php
require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');
require_once(__DIR__ . '/../../controllers/QuizController.php');
 
$user      = verifyToken();
$search    = $_GET['search']     ?? '';
$subjectId = $_GET['subject_id'] ?? null;

$page  = $_GET['page']  ?? 1;
$limit = $_GET['limit'] ?? 7;
 
$controller = new QuizController();
$quizzes    = $controller->getQuizzes($search, $subjectId, $page, $limit);
 
sendResponse(true, "Success", $quizzes);
