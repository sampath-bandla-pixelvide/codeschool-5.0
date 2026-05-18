<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        sendResponse(false, "POST method only");
    }

    $name = trim($_POST["name"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $phone = trim($_POST["phone"] ?? "");

    if ($name === "" || $email === "" || $phone === "") {
        sendResponse(false, "All fields are required");
    }

    if (strlen($name) < 3) {
        sendResponse(false, "Name must be at least 3 characters");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendResponse(false, "Invalid email format");
    }

    if (!preg_match("/^[6-9][0-9]{9}$/", $phone)) {
        sendResponse(false, "Invalid phone number");
    }

    $pdo = getPDO();

    $checkQuery = "SELECT * FROM users WHERE email = :email OR phone = :phone";
    $stmt = $pdo->prepare($checkQuery);
    $stmt->execute([
        "email" => $email,
        "phone" => $phone
    ]);

    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingUser) {
        sendResponse(false, "Email or phone already registered");
    }

    $insertQuery = "INSERT INTO users (name, email, phone)
                    VALUES (:name, :email, :phone)";

    $stmt = $pdo->prepare($insertQuery);
    $status = $stmt->execute([
        "name" => $name,
        "email" => $email,
        "phone" => $phone
    ]);

    if (!$status) {
        sendResponse(false, "Registration failed");
    }

    sendResponse(true, "Account created successfully");
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
