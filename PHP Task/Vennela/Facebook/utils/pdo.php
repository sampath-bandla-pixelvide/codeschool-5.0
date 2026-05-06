<?php
function getPDO() {
    $host = "localhost";
    $port = "5432";
    $db   = "store";
    $user = "postgres";
    $pass = "postgres";

    try {
        $pdo = new PDO(
            "pgsql:host=$host;port=$port;dbname=$db",
            $user,
            $pass
        );

        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;

    } catch (PDOException $e) {
        die("DB Error: " . $e->getMessage());
    }
}