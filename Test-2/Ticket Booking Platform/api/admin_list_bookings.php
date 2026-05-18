<?php
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
$ctrl->adminListBookings();
