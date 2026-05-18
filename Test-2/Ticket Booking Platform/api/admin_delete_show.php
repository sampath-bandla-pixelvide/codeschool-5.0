<?php
require_once __DIR__ . "/controllers/movieControllers.php";
require_once __DIR__ . "/controllers/bookingControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = $_POST['token'] ?? '';
if (!$token) {
    sendResponse(false, "Unauthorized");
}
$ctrl = new BookingController();
$role = $ctrl->getUserRoleFromToken($token);
if ($role !== 'admin') {
    sendResponse(false, "Admin access required");
}

$id = (int)($_POST['id'] ?? 0);
if (!$id) {
    sendResponse(false, "Show ID is required");
}

$movieCtrl = new MovieController();
$movieCtrl->deleteShow($id);
