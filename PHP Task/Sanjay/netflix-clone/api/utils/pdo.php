<?php

define("DB_HOST","localhost");
define("DB_PORT","5432");
define("DB_NAME","netflix");
define("DB_USERNAME","postgres");
define("DB_PASSWORD","sai@143");

function getPDO() {
    $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
    $pdo = new PDO($dsn,DB_USERNAME,DB_PASSWORD);
    $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
    return $pdo;
}
?>