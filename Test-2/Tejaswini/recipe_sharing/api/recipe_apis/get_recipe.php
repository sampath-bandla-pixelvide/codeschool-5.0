<?php

require_once __DIR__ . "/../controllers/RecipeController.php";

$controller = new RecipeController();

$id = $_POST["id"] ?? null;
if (!$id) {
    return sendResponse(false, "Recipe id is required");
}
$controller->getRecipe($id);
