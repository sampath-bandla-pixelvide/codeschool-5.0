<?php
require_once __DIR__ . "/../utils/pdo.php";
require_once __DIR__ . "/../validations/functions.php";
$pdo = getPDO();
$contact = trim($_POST['contact'] ?? '');
$password = trim($_POST['password'] ?? '');
$contact_clean = preg_replace('/\D/', '', $contact);
$email = null;
$mobile = null;
$errors = [];
if ($msg = validateContact($contact, $email, $mobile)) {
    $errors['contact'] = $msg;
}
if ($msg = validatePassword($password)) {
    $errors['password'] = $msg;
}
if (!empty($errors)) {
    echo json_encode([
        "status" => "error",
        "errors" => $errors
    ]);
    exit();
}
if ($email) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
} else {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE mobile = ?");
    $stmt->execute([$contact_clean]);
}
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    echo "email_error";
    exit();
}
if (md5($password) !== $user['password']) {
    echo "password_error";
    exit();
}
session_start();
$_SESSION['user_id'] = $user['id'];
echo "success";