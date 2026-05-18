<?php
require_once __DIR__ . '/../utils/functions.php';
require_once __DIR__ . '/../controllers/AdminController.php';

header('Content-Type: application/json');

$ctrl = new AdminController();
$ctrl->getStats();
