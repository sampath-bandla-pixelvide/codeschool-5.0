<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        sendResponse(false, "POST method only");
    }

    $phone = trim($_POST["phone"] ?? "");

    if ($phone === "") {
        sendResponse(false, "Phone is required");
    }

    if (!preg_match("/^[6-9][0-9]{9}$/", $phone)) {
        sendResponse(false, "Invalid phone number");
    }

    $pdo = getPDO();

    $query = "SELECT * FROM users WHERE phone = :phone";
    $stmt = $pdo->prepare($query);
    $stmt->execute(["phone" => $phone]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendResponse(false, "User not found. Please create account first.");
    }

    $oldOtpQuery = "UPDATE otp_codes 
                    SET is_used = true 
                    WHERE user_id = :user_id 
                    AND is_used = false";

    $stmt = $pdo->prepare($oldOtpQuery);
    $stmt->execute([
        "user_id" => $user["id"]
    ]);

    $otp = rand(100000, 999999);
    $expiresAt = date("Y-m-d H:i:s", strtotime("+1 minute"));

    $insertQuery = "INSERT INTO otp_codes (user_id, otp_code, expires_at)
                    VALUES (:user_id, :otp_code, :expires_at)";

    $stmt = $pdo->prepare($insertQuery);
    $stmt->execute([
        "user_id" => $user["id"],
        "otp_code" => $otp,
        "expires_at" => $expiresAt
    ]);

    sendResponse(true, "OTP sent successfully. Your OTP is: " . $otp);

} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}