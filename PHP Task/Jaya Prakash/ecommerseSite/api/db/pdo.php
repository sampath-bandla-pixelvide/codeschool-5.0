<?php
function getPDO(){
    $pdo = new PDO("pgsql:host=localhost;dbname=ecommerce","postgres","12345");    
    $pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    return $pdo;
}
?>