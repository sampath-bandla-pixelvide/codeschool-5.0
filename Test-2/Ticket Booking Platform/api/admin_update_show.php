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

$id        = (int)($_POST['id']         ?? 0);
$movieId   = (int)($_POST['movie_id']   ?? 0);
$theatreId = (int)($_POST['theatre_id'] ?? 0);
$showDate  = trim($_POST['show_date']   ?? '');
$showTime  = trim($_POST['show_time']   ?? '');
$price     = (float)($_POST['price']    ?? 0);

if (!$id || !$movieId || !$theatreId || !$showDate || !$showTime || !$price) {
    sendResponse(false, "All fields are required");
}

$movieCtrl = new MovieController();
$movieCtrl->updateShow($id, $movieId, $theatreId, $showDate, $showTime, $price);
