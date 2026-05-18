<?php
require_once __DIR__ . "/controllers/movieControllers.php";
require_once __DIR__ . "/controllers/bookingControllers.php";
$token = $_POST['token'] ?? '';
if (!$token) {
    require_once __DIR__ . "/utils/functions.php";
    sendResponse(false, "Unauthorized");
}
$ctrl = new BookingController();
$role = $ctrl->getUserRoleFromToken($token);
if ($role !== 'admin') {
    require_once __DIR__ . "/utils/functions.php";
    sendResponse(false, "Admin access required");
}
$name       = trim($_POST['name']        ?? '');
$location   = trim($_POST['location']    ?? '');
$totalSeats = (int)($_POST['total_seats'] ?? 0);
if (!$name || !$location || !$totalSeats) {
    require_once __DIR__ . "/utils/functions.php";
    sendResponse(false, "All fields required");
}
$movieCtrl = new MovieController();
$movieCtrl->createTheatre($name, $location, $totalSeats);
