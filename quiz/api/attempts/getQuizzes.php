<?php

require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');
require_once(__DIR__ . '/../../controllers/QuizController.php');

$user = verifyToken();
$search = $_GET['search'] ?? '';

$controller = new QuizController();
$data = $controller->getQuizzesForUser($user['id'],$search);

sendResponse(true, "Success", $data);