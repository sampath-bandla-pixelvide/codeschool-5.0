<?php
require_once __DIR__ . "/controllers/movieControllers.php";
$obj = new MovieController();
$obj->listGenres();
