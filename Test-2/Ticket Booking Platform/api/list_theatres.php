<?php
require_once __DIR__ . "/controllers/movieControllers.php";
$movieId = isset($_POST['movie_id']) ? (int)$_POST['movie_id'] : 0;
if (!$movieId) { require_once __DIR__ . "/utils/functions.php"; sendResponse(false, "movie_id required"); }
$obj = new MovieController();
$obj->listTheatresForMovie($movieId);
