<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {
    $token = $_POST["token"] ?? "";

    if ($token === "") {
        sendResponse(false, "Token required");
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

    $query = "SELECT m.*
              FROM watchlist w
              JOIN movies m ON m.id = w.movie_id
              WHERE w.user_id = :user_id
              ORDER BY w.id DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute([
        "user_id" => $userId
    ]);

    $movies = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse(true, "Watchlist fetched", $movies);
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
