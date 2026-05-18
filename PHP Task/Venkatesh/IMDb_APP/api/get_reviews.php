<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {
    $movieId = $_GET['movie_id'] ?? null;

    if (!$movieId) {
        sendResponse(false, "Movie ID is required");
    }

    $pdo = getPDO();

    $query = "SELECT r.*, u.name 
              FROM reviews r
              JOIN users u ON u.id = r.user_id
              WHERE r.movie_id = :movie_id
              ORDER BY r.id DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute([
        "movie_id" => $movieId
    ]);

    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse(true, "Reviews fetched", $reviews);
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
