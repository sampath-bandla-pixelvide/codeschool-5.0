<?php

header("Content-Type: application/json");


require_once(__DIR__ . "/../config/db.php");
require_once(__DIR__ . "/../config/commonfunctions.php");
require_once(__DIR__ . "/../controllers/AuthController.php");


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    getResponse(false, "Invalid request method");
}


$auth = new AuthController();


$auth->register($_POST);