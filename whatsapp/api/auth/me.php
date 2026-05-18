<?php

require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../middleware/auth.php');

$user = verifyToken();
unset($user['password_hash']);
if (!empty($user['profile_picture'])) {
    $user['profile_picture'] = $user['profile_picture'];
    
}

sendResponse(true, "User fetched", $user);