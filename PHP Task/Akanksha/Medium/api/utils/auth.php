<?php

function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        sendResponse(false, "Unauthorized");
    }

    return $_SESSION['user_id'];
}