<?php

require_once __DIR__ . "/controllers/AuthControllers.php";

$obj=new AuthController();
echo $obj->getTeluguMovies();