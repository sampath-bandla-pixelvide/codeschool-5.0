<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {
    $name  = $_POST["name"] ?? "";
    $email = $_POST["email"] ?? "";
    $phone = $_POST["phone"] ?? "";
    $token = $_POST["token"] ?? "";

    if ($name === "" || $email === "" || $phone === "" || $token === "") {
        sendResponse(false, "All fields are required");
    }

    $pdo = getPDO();

    $tokenQuery = "SELECT user_id 
                   FROM user_tokens 
                   WHERE token = :token 
                   AND expiry_at > NOW() 
                   ORDER BY id DESC 
                   LIMIT 1";

    $stmt = $pdo->prepare($tokenQuery);
    $stmt->execute(["token" => $token]);

    $tokenData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tokenData) {
        sendResponse(false, "Invalid or expired token");
    }

    $userId = $tokenData["user_id"];

    $checkEmail = "SELECT id FROM users WHERE email = :email AND id != :id";
    $stmt = $pdo->prepare($checkEmail);
    $stmt->execute([
        "email" => $email,
        "id" => $userId
    ]);

    if ($stmt->fetch()) {
        sendResponse(false, "Email already exists");
    }

    $checkPhone = "SELECT id FROM users WHERE phone = :phone AND id != :id";
    $stmt = $pdo->prepare($checkPhone);
    $stmt->execute([
        "phone" => $phone,
        "id" => $userId
    ]);

    if ($stmt->fetch()) {
        sendResponse(false, "Phone already exists");
    }

    $updateQuery = "UPDATE users
                    SET name = :name,
                        email = :email,
                        phone = :phone,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id";

    $stmt = $pdo->prepare($updateQuery);

    $status = $stmt->execute([
        "name" => $name,
        "email" => $email,
        "phone" => $phone,
        "id" => $userId
    ]);

    if (!$status) {
        sendResponse(false, "Profile update failed");
    }

    sendResponse(true, "Profile updated successfully");
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
