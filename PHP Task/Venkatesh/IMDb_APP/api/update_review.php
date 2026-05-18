<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        sendResponse(false, "POST method only");
    }

    $reviewId = $_POST["review_id"] ?? "";
    $rating = $_POST["rating"] ?? "";
    $reviewText = $_POST["review_text"] ?? "";
    $token = $_POST["token"] ?? "";

    if ($reviewId === "" || $rating === "" || $reviewText === "" || $token === "") {
        sendResponse(false, "All fields are required");
    }

    if ($rating < 1 || $rating > 5) {
        sendResponse(false, "Rating must be between 1 and 5");
    }

    $pdo = getPDO();

    // Get logged-in user from token
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

    // Update only logged-in user's review
    $updateQuery = "UPDATE reviews
                    SET rating = :rating,
                        review_text = :review_text,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                    AND user_id = :user_id";

    $stmt = $pdo->prepare($updateQuery);

    $status = $stmt->execute([
        "rating" => $rating,
        "review_text" => $reviewText,
        "id" => $reviewId,
        "user_id" => $userId
    ]);

    if (!$status || $stmt->rowCount() === 0) {
        sendResponse(false, "Review update failed or not allowed");
    }

    sendResponse(true, "Review updated successfully");
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
