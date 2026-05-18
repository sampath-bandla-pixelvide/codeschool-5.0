<?php
require_once __DIR__ . '/../utils/functions.php';
require_once __DIR__ . '/../controllers/UserController.php';

header('Content-Type: application/json');

$category_id = (int)($_GET['category_id'] ?? 0);
$search      = trim($_GET['search']       ?? '');
$veg         = $_GET['veg']              ?? '';

$ctrl = new UserController();
$ctrl->getMenu();
