<?php

require_once __DIR__ . "/Controllers/AdminController.php";

$adminController =
    new AdminController();

echo $adminController->getQueueStatus();