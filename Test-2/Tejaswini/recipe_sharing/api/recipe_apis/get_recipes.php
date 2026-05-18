<?php

require_once __DIR__ . "/../middlewares/AuthMiddleware.php";
require_once __DIR__ . "/../controllers/RecipeController.php";

verifyToken();

$controller = new RecipeController();

$search = $_GET["search"] ?? "";

$controller->getRecipes($search);