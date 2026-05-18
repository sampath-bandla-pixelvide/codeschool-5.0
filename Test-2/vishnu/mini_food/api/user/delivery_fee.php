<?php
require_once __DIR__ . '/../utils/functions.php';
require_once __DIR__ . '/../controllers/UserController.php';

header('Content-Type: application/json');

$ctrl = new UserController();
$ctrl->getDeliveryFee();
