<?php
require_once __DIR__ . "/controllers/movieControllers.php";
$movieId   = isset($_POST['movie_id'])   ? (int)$_POST['movie_id']   : 0;
$theatreId = isset($_POST['theatre_id']) ? (int)$_POST['theatre_id'] : 0;
$showDate  = isset($_POST['show_date'])  ? $_POST['show_date']        : '';
if (!$movieId || !$theatreId || !$showDate) { require_once __DIR__ . "/utils/functions.php"; sendResponse(false, "movie_id, theatre_id and show_date required"); }
$obj = new MovieController();
$obj->listShows($movieId, $theatreId, $showDate);
