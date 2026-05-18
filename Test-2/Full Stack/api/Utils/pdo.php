<?php

function getPDO()
{
    $pdo = new PDO("pgsql:host=localhost;dbname=test", "postgres", "postgres");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $pdo;
}
