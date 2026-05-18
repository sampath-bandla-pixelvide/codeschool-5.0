<?php

require_once __DIR__ . "/controllers/VoteController.php";

$poll_id = $_POST['poll_id'] ?? null;
$option_id = $_POST['option_id'] ?? null;

$voteController = new VoteController();
$voteController->vote($poll_id, $option_id);
