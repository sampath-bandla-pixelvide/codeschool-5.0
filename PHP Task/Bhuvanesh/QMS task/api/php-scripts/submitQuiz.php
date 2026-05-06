<?php
require_once __DIR__ . '/../controllers/authController.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    return sendResponse(false, "Invalid method");
}

$headers = getallheaders();
if (!isset($headers['Authorization'])) return sendResponse(false, "Authorization header missing");
$authHeader = $headers['Authorization'];
if (strpos($authHeader, 'Bearer ') !== 0) return sendResponse(false, "Invalid Authorization format");

$token = substr($authHeader, 7);

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) return sendResponse(false, "Invalid JSON input");

if (
    !isset($input['quiz_id']) ||
    !isset($input['answers']) ||
    !isset($input['started_at'])
) {
    return sendResponse(false, "Missing required fields");
}

if (!is_array($input['answers'])) {
    return sendResponse(false, "Invalid answers format");
}

$data = new authController();
return $data->submitQuiz($token, $input['quiz_id'], $input['answers'], $input['started_at']);
