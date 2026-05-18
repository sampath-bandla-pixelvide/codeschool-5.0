<?php

require_once __DIR__ . '/controllers/AuthController.php';

$token = getallheaders()['Authorization'] ?? '';

$auth = new AuthController();

$validate = $auth->validateToken($token);

if (!$validate) {

  sendResponse(false, "Token expired");
}

sendResponse(true, "Valid token");
