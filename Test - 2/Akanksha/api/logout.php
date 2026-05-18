<?php

require_once __DIR__ . '/controllers/AuthController.php';

$token = getallheaders()['Authorization'] ?? '';

$auth = new AuthController();

$auth->logout($token);
