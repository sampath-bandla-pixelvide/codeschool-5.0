<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {

    $movieId = $_GET['id'] ?? null;

    if (!$movieId) {
        sendResponse(false, "Movie ID is required");
    }

    $pdo = getPDO();

    $query = "SELECT * FROM movies WHERE id = :id";
    $stmt = $pdo->prepare($query);
    $stmt->execute(['id' => $movieId]);

    $movie = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$movie) {
        sendResponse(false, "Movie not found");
    }

    sendResponse(true, "Movie fetched", $movie);
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
