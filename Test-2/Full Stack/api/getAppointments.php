<?php

require_once __DIR__ . "/Controllers/UserController.php";

$page =
    $_GET["page"] ?? 1;

$userController =
    new UserController();

echo $userController->getAppointments(
    $page
);