<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {
    $token = $_POST["token"] ?? "";

    if ($token === "") {
        sendResponse(false, "Token is required");
    }

    $pdo = getPDO();

    $query = "SELECT u.id, u.name, u.email, u.phone
              FROM user_tokens t
              JOIN users u ON u.id = t.user_id
              WHERE t.token = :token
              AND t.expiry_at > NOW()
              ORDER BY t.id DESC
              LIMIT 1";

    $stmt = $pdo->prepare($query);
    $stmt->execute([
        "token" => $token
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendResponse(false, "Invalid or expired token");
    }

    sendResponse(true, "User fetched", $user);
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
