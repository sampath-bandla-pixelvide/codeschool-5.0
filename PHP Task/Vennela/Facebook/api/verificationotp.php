<?php
require_once __DIR__ . "/../utils/pdo.php";
require_once __DIR__ . "/../validations/functions.php";
$pdo = getPDO();
$contact = trim($_POST['contact'] ?? '');
$otp = trim($_POST['otp'] ?? '');
$email = null;
$mobile = null;
validateContact($contact, $email, $mobile);
if ($email) {
    $stmt = $pdo->prepare("SELECT id,otp, otp_expiry FROM users WHERE email = ?");
    $stmt->execute([$email]);
} else {
    $stmt = $pdo->prepare("SELECT id,otp, otp_expiry FROM users WHERE mobile = ?");
    $stmt->execute([$mobile]);
}
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    echo "invalid_otp";
    exit();
}
if ($otp !== $user['otp']) {
    echo "invalid_otp";
    exit();
}
if (strtotime($user['otp_expiry']) < time()) {
    echo "expired";
    exit();
}
session_start();
$_SESSION['user_id'] = $user['id'];
echo "success";
exit;