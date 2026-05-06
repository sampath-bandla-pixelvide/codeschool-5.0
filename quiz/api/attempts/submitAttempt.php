<?php

require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../middleware/auth.php');
require_once(__DIR__ . '/../../controllers/AttemptController.php');

//  get user from token
$user = verifyToken();

$quizId = $_POST['quiz_id'] ?? null;
$answers = $_POST['answers'] ?? null;

// decode answers JSON
$answers = json_decode($answers, true);

// validation
// if (!$quizId || !is_array($answers)) {
//     sendResponse(false, "Invalid data");
// }
if (!$quizId) {
    sendResponse(false, "Invalid data");
}

$controller = new AttemptController();
$result = $controller->submitAttempt($user['id'], $quizId, $answers);

// return response
sendResponse($result['status'], $result['message'] ?? "Success", $result['data'] ?? null);