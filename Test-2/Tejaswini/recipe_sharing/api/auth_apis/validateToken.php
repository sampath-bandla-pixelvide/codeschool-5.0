<?php

require_once __DIR__ . "/../controllers/AuthController.php";
require_once __DIR__ . "/../utils/functions.php";
require_once __DIR__ . "/../middlewares/AuthMiddleware.php";


// $token = getTokenFromHeader();

// if (!$token) {
//     sendResponse(false, "Token not found");
// }

// $authController = new AuthController();

// $authController->validateToken($token);
verifyToken();
sendResponse(true, 'Token is valid',[
    'user' => $_SESSION['user']
]);
