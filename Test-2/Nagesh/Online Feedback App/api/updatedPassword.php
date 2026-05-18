<?php

require_once __DIR__ . "/../controllers/AuthController.php";

$userId = $_POST["userId"] ?? null;
$oldPassword = $_POST["oldPassword"] ?? null;
$password = $_POST["password"] ?? null;
$confirm_password = $_POST["confirmPassword"] ?? null;

if (!$userId) {
    // Fallback to email update if it's the forgot password flow
    if (isset($_POST["email"])) {
        $email = $_POST["email"];
        $obj = new AuthController();
        $isValidPassword = AuthController::validatePassword($password);
        $status = $obj->confirmPasswordStatus($password, $confirm_password); 
        if ($isValidPassword && $status) {
            $obj->changePassword($email, $password);
        }
        exit;
    }
    echo json_encode(['status' => false, 'message' => 'User ID is required']);
    exit;
}

$obj = new AuthController();
$isValidPassword = AuthController::validatePassword($password);
$status = $obj->confirmPasswordStatus($password, $confirm_password); 

if ($isValidPassword && $status) {
    $obj->updatePassword($userId, $oldPassword, $password);
}
