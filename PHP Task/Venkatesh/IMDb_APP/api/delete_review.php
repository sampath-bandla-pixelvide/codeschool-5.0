<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        sendResponse(false, "POST method only");
    }

    $reviewId = $_POST["review_id"] ?? "";
    $token = $_POST["token"] ?? "";

    if ($reviewId === "" || $token === "") {
        sendResponse(false, "Review ID and token are required");
    }

    $pdo = getPDO();

    $tokenQuery = "SELECT user_id FROM user_tokens
                   WHERE token = :token
                   AND expiry_at > NOW()";

    $stmt = $pdo->prepare($tokenQuery);
    $stmt->execute([
        "token" => $token
    ]);

    $tokenData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tokenData) {
        sendResponse(false, "Invalid or expired token");
    }

    $userId = $tokenData["user_id"];

    $deleteQuery = "DELETE FROM reviews
                    WHERE id = :id
                    AND user_id = :user_id";

    $stmt = $pdo->prepare($deleteQuery);

    $status = $stmt->execute([
        "id" => $reviewId,
        "user_id" => $userId
    ]);

    if (!$status || $stmt->rowCount() === 0) {
        sendResponse(false, "Review delete failed or not allowed");
    }

    sendResponse(true, "Review deleted successfully");
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
