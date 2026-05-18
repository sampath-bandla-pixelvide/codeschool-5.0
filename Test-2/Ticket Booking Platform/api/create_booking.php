<?php
require_once __DIR__ . "/controllers/bookingControllers.php";
$token   = $_POST['token']    ?? '';
$showId  = isset($_POST['show_id']) ? (int)$_POST['show_id'] : 0;
$seatIds = isset($_POST['seat_ids']) ? json_decode($_POST['seat_ids'], true) : [];
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
if (!$showId || empty($seatIds)) {
    require_once __DIR__ . "/utils/functions.php";
    sendResponse(false, "show_id and seat_ids required");
}
$ctrl->createBooking($userId, $showId, $seatIds);
