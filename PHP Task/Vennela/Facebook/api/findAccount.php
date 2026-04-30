<?php
require_once __DIR__ . "/../utils/pdo.php";
require_once __DIR__ . "/../validations/functions.php";
$pdo = getPDO();
$contact = trim($_POST['contact'] ?? '');
$email = null;
$mobile = null;
if ($msg = validateContact($contact, $email, $mobile)) {
    echo "not_found";
    exit();
}
if ($email) {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
} else {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE mobile = ?");
    $stmt->execute([$mobile]);
}
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    echo "not_found";
    exit();
}
$otp = rand(100000, 999999);
$expiry = date("Y-m-d H:i:s", strtotime("+2 minutes"));
if ($email) {
    $stmt = $pdo->prepare("UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?");
    $stmt->execute([$otp, $expiry, $email]);
} else {
    $stmt = $pdo->prepare("UPDATE users SET otp = ?, otp_expiry = ? WHERE mobile = ?");
    $stmt->execute([$otp, $expiry, $mobile]);
}
echo $otp;   