<?php

require_once __DIR__ . "/Controllers/UserController.php";

$userController =
    new UserController();

$response =
    $userController->getWaitingCount();

echo $response;