<?php

session_start();

require_once __DIR__ . "/utils/functions.php";

if (!isset($_SESSION['user'])) {

    sendResponse(false, "User not logged in");
}

sendResponse(true, "User details fetched", $_SESSION['user']);