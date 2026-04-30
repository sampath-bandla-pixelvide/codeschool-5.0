<?php

require_once(__DIR__ . "/utils/pdo.php");
require_once(__DIR__ . "/utils/functions.php");

try {
    $pdo = getPDO();

    $query = "SELECT id, name, image, ranking, popularity
              FROM celebrities
              ORDER BY ranking ASC";

    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $celebrities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse(true, "Celebrities fetched successfully", $celebrities);
} catch (Exception $e) {
    sendResponse(false, $e->getMessage());
}
