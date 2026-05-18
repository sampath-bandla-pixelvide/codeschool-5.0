<?php
require_once __DIR__ . "/controllers/movieControllers.php";
$genreId = isset($_POST['genre_id']) && $_POST['genre_id'] !== '' ? (int)$_POST['genre_id'] : null;
$obj = new MovieController();
$obj->listMovies($genreId);
