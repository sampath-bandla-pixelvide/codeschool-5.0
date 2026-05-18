<?php

require_once __DIR__ . "/../controllers/AuthController.php";
require_once __DIR__ . "/../middlewares/AuthMiddleware.php";

verifyToken();

$user = $_SESSION['user'];

$auth = new AuthController();

$auth->logout($user['id']);