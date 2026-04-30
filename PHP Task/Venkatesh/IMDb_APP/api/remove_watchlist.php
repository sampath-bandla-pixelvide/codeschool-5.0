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

    $tokenQuery = "SELECT user_id FROM user_tokens
                   WHERE token = :token
                   AND expiry_at > NOW()";

    $stmt = $pdo->prepare($tokenQuery);
    $stmt->execute(["token" => $token]);

    $tokenData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tokenData) {
        sendResponse(false, "Invalid or expired token");
    }

    $userId = $tokenData["user_id"];

    $deleteQuery = "DELETE FROM watchlist
                    WHERE user_id = :user_id
                    AND movie_id = :movie_id";

    $stmt = $pdo->prepare($deleteQuery);
    $stmt->execute([
        "user_id" => $userId,
        "movie_id" => $movieId
    ]);

    sendResponse(true, "Removed from watchlist");
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
