<?php
require_once __DIR__ . "/controllers/movieControllers.php";
$movieId   = isset($_POST['movie_id'])   ? (int)$_POST['movie_id']   : 0;
$theatreId = isset($_POST['theatre_id']) ? (int)$_POST['theatre_id'] : 0;
if (!$movieId || !$theatreId) { require_once __DIR__ . "/utils/functions.php"; sendResponse(false, "movie_id and theatre_id required"); }
$obj = new MovieController();
$obj->listShowDates($movieId, $theatreId);
