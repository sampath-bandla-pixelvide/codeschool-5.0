<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {
    $pdo = getPDO();

    $query = "
SELECT m.*, 
       ROUND(AVG(r.rating), 1) AS rating
FROM movies m
LEFT JOIN reviews r ON m.id = r.movie_id
GROUP BY m.id
ORDER BY m.id ASC
";
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $movies = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse(true, "Movies fetched successfully", $movies);
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
