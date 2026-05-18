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
$movieId   = (int)($_POST['movie_id']   ?? 0);
$theatreId = (int)($_POST['theatre_id'] ?? 0);
$showDate  = trim($_POST['show_date']   ?? '');
$showTime  = trim($_POST['show_time']   ?? '');
$price     = (float)($_POST['price']    ?? 0);
if (!$movieId || !$theatreId || !$showDate || !$showTime || !$price) {
    require_once __DIR__ . "/utils/functions.php";
    sendResponse(false, "All fields required");
}
$movieCtrl = new MovieController();
$movieCtrl->createShow($movieId, $theatreId, $showDate, $showTime, $price);
