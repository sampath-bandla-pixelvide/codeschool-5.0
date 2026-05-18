<?php

require_once __DIR__ . "/controllers/AuthController.php";
require_once __DIR__ . "/controllers/PollController.php";

$headers = getallheaders();

$token = $headers['Authorization'] ?? '';

$auth = new AuthController();

$auth->validateToken($token);

$question = $_POST['question'];
$start_time = $_POST['start_time'];
$end_time = $_POST['end_time'];
$options = $_POST['options'];
$poll = new PollController();

$poll->createPoll(
    $question,
    $start_time,
    $end_time,
    $options
);