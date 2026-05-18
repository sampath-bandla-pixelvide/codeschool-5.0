<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        sendResponse(false, "POST method only");
    }

    $movieId = $_POST["movie_id"] ?? "";
    $rating = $_POST["rating"] ?? "";
    $reviewText = $_POST["review_text"] ?? "";
    $token = $_POST["token"] ?? "";

    if ($movieId === "" || $rating === "" || $reviewText === "" || $token === "") {
        sendResponse(false, "All fields are required");
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

    $checkQuery = "SELECT * FROM reviews 
                   WHERE user_id = :user_id AND movie_id = :movie_id";

    $stmt = $pdo->prepare($checkQuery);
    $stmt->execute([
        "user_id" => $userId,
        "movie_id" => $movieId
    ]);

    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        sendResponse(false, "You already reviewed this movie");
    }

    $insertQuery = "INSERT INTO reviews (user_id, movie_id, rating, review_text)
                    VALUES (:user_id, :movie_id, :rating, :review_text)";

    $stmt = $pdo->prepare($insertQuery);

    $status = $stmt->execute([
        "user_id" => $userId,
        "movie_id" => $movieId,
        "rating" => $rating,
        "review_text" => $reviewText
    ]);

    if (!$status) {
        sendResponse(false, "Failed to add review");
    }

    sendResponse(true, "Review added successfully");
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
