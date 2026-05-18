<?php

define("DB_HOST", "localhost");
define("DB_PORT", "5432");
define("DB_NAME", "whatsapp");
define("DB_USERNAME", "postgres");
define("DB_PASSWORD", "postgres");

function getPDO()
{
    $pdo = new PDO(
        "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME,
        DB_USERNAME,
        DB_PASSWORD
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    return $pdo;
}