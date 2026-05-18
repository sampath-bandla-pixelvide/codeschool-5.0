<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {

    $movieId = $_POST["movie_id"] ?? "";
    $token = $_POST["token"] ?? "";

    if ($movieId === "" || $token === "") {
        sendResponse(false, "All fields required");
    }

    $pdo = getPDO();

    // Get user from token
    $query = "SELECT user_id FROM user_tokens WHERE token = :token AND expiry_at > NOW()";
    $stmt = $pdo->prepare($query);
    $stmt->execute(["token" => $token]);

    $tokenData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tokenData) {
        sendResponse(false, "Invalid token");
    }

    $userId = $tokenData["user_id"];

    // Prevent duplicate
    $check = "SELECT * FROM watchlist WHERE user_id = :user_id AND movie_id = :movie_id";
    $stmt = $pdo->prepare($check);
    $stmt->execute([
        "user_id" => $userId,
        "movie_id" => $movieId
    ]);

    if ($stmt->fetch()) {
        sendResponse(false, "Already in watchlist");
    }

    // Insert
    $insert = "INSERT INTO watchlist (user_id, movie_id)
               VALUES (:user_id, :movie_id)";

    $stmt = $pdo->prepare($insert);
    $stmt->execute([
        "user_id" => $userId,
        "movie_id" => $movieId
    ]);

    sendResponse(true, "Added to watchlist");
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
