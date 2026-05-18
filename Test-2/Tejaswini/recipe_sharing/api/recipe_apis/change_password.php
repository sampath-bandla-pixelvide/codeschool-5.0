<?php

require_once __DIR__ . "/../controllers/RecipeController.php";
require_once __DIR__ . "/../middlewares/AuthMiddleware.php";
verifyToken();
$controller = new RecipeController();

$controller->changePassword(
    $_SESSION["user"]["id"],
    $_POST["current_password"] ?? "",
    $_POST["new_password"] ?? "",
    $_POST["confirm_password"] ?? ""
);