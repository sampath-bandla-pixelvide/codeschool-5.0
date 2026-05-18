<?php

require_once __DIR__ . "/../controllers/RecipeController.php";
require_once __DIR__ . "/../middlewares/AuthMiddleware.php";
verifyToken();
$controller = new RecipeController();

$title = $_POST["title"] ?? "";
$description = $_POST["description"] ?? "";
$ingredient = $_POST["ingredient"] ?? "";
$steps = $_POST["steps"] ?? "";

$images = $_FILES["images"] ?? null;

$controller->addRecipe(
    $title,
    $description,
    $ingredient,
    $steps,
    $images
);