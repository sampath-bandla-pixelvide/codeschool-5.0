<?php
require_once __DIR__ . "/controllers/movieControllers.php";
$showId = isset($_POST['show_id']) ? (int)$_POST['show_id'] : 0;
if (!$showId) { require_once __DIR__ . "/utils/functions.php"; sendResponse(false, "show_id required"); }
$obj = new MovieController();
$obj->listSeats($showId);
