<?php
require_once(__DIR__."/../utils/functions.php");

verifyToken();
// session_start();
// $_SESSION = [];
session_unset();
session_destroy();

echo json_encode([
    "status" => true,
    "message" => "Logged out successfully"
]);