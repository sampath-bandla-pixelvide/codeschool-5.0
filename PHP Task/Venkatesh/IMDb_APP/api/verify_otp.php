<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        sendResponse(false, "POST method only");
    }

    $phone = trim($_POST["phone"] ?? "");
    $otp = trim($_POST["otp"] ?? "");

    if ($phone === "" || $otp === "") {
        sendResponse(false, "Phone and OTP are required");
    }

    $pdo = getPDO();

    $userQuery = "SELECT * FROM users WHERE phone = :phone";
    $stmt = $pdo->prepare($userQuery);
    $stmt->execute([
        "phone" => $phone
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendResponse(false, "User not found");
    }

    $otpQuery = "SELECT * FROM otp_codes
                 WHERE user_id = :user_id
                 AND otp_code = :otp_code
                 AND is_used = false
                 ORDER BY id DESC
                 LIMIT 1";

    $stmt = $pdo->prepare($otpQuery);
    $stmt->execute([
        "user_id" => $user["id"],
        "otp_code" => $otp
    ]);

    $otpData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$otpData) {
        sendResponse(false, "Invalid OTP");
    }

    if (strtotime($otpData["expires_at"]) < time()) {
        sendResponse(false, "OTP expired");
    }

    $updateOtp = "UPDATE otp_codes SET is_used = true WHERE id = :id";
    $stmt = $pdo->prepare($updateOtp);
    $stmt->execute([
        "id" => $otpData["id"]
    ]);

    $token = bin2hex(random_bytes(10));
    $expiry = date("Y-m-d H:i:s", strtotime("+1 day"));

    $tokenQuery = "INSERT INTO user_tokens (user_id, token, expiry_at)
                   VALUES (:user_id, :token, :expiry_at)";

    $stmt = $pdo->prepare($tokenQuery);
    $stmt->execute([
        "user_id" => $user["id"],
        "token" => $token,
        "expiry_at" => $expiry
    ]);

    sendResponse(true, "Login successful", [
        "token" => $token,
        "user_id" => $user["id"],
        "name" => $user["name"]
    ]);
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
