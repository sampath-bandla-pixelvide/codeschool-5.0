<?php

require_once __DIR__ . "/controllers/PollController.php";

$poll = new PollController();

$poll->getPublicPolls();
