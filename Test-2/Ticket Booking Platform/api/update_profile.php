<?php
require_once __DIR__ . "/controllers/authControllers.php";
require_once __DIR__ . "/utils/functions.php";
$headers = apache_request_headers();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
if (!$token) {
    sendResponse(false, "Unauthorized access");
}
$firstName = isset($_POST['first_name']) ? trim($_POST['first_name']) : '';
$lastName = isset($_POST['last_name']) ? trim($_POST['last_name']) : '';
$dob = isset($_POST['dob']) ? trim($_POST['dob']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
if (empty($firstName) || empty($lastName) || empty($dob) || empty($phone)) {
    sendResponse(false, "All fields are required");
}
$auth = new AuthController();
$auth->updateProfile($token, $firstName, $lastName, $dob, $phone);
