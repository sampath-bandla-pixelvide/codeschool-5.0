<?php
require_once __DIR__ . "/controllers/bookingControllers.php";
$token = $_POST['token'] ?? '';
if (!$token) {
    require_once __DIR__ . "/utils/functions.php";
    sendResponse(false, "Unauthorized");
}
$ctrl   = new BookingController();
$userId = $ctrl->getUserIdFromToken($token);
if (!$userId) {
    require_once __DIR__ . "/utils/functions.php";
    sendResponse(false, "Invalid or expired session");
}
$ctrl->listMyBookings($userId);
