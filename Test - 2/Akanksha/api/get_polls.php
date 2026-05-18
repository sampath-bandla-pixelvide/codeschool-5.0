<?php

require_once __DIR__ . "/controllers/AuthController.php";
require_once __DIR__ . "/controllers/PollController.php";

$headers = getallheaders();

$token = $headers['Authorization'] ?? '';

$auth = new AuthController();

$auth->validateToken($token);

$poll = new PollController();

$poll->getPolls();