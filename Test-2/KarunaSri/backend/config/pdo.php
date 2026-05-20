<?php

define("DB_HOST", "localhost");
define("DB_PORT", "5432");
define("DB_NAME", "orr_toll_system");
define("DB_USERNAME", "postgres");
define("DB_PASSWORD", "karunasri@679");

function getPDO()
{
    try {
        $pdo = new PDO("pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";user=" . DB_USERNAME . ";password=" . DB_PASSWORD . "");
        $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}
