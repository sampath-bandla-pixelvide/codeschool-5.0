<?php
require_once(__DIR__ . "/controllers/AuthController.php");

function authenticate() {
    return AuthController::authenticate();  
}
