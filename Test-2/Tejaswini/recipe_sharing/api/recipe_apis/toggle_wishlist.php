<?php

require_once __DIR__ . "/../controllers/RecipeController.php";
require_once __DIR__ . "/../middlewares/AuthMiddleware.php";

verifyToken();
$controller = new RecipeController();
$recipeId = $_POST["recipe_id"] ?? null;
$controller->toggleWishlist($recipeId);