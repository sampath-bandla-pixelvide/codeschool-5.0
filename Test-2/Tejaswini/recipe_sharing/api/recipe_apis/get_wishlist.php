<?php

require_once __DIR__ . "/../controllers/RecipeController.php";
require_once __DIR__ . "/../middlewares/AuthMiddleware.php";
verifyToken();
// $userId = $_POST["user_id"] ?? null;
// if (!$userId) {
//     return sendResponse(false, "User id is required");
// }
$user = $_SESSION['user'];
$controller = new RecipeController();
$controller->getWishlist($user['id']);
