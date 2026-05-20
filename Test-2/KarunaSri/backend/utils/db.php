<?php

require_once(__DIR__ . "/../config/pdo.php");

class DB {
    private $pdo = null;
    private $stmt = null;
    public $query = '';

    function __construct()
    {
        $this->pdo = getPDO();   
    }

    public function run($query, $params = []) {
        $this->stmt = $this->pdo->prepare($query);
        $this->stmt->execute($params);
        return $this->stmt;
    }

    public function first($query, $params = []) {
        return $this->run($query, $params)->fetch(PDO::FETCH_ASSOC);
    }

    public function get($query, $params = []) {
        return $this->run($query, $params)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($query, $params = []) {
        $this->run($query, $params);
        return $this->pdo->lastInsertId();
    }

    public function executeQuery($query, $params = []) {
        return $this->run($query, $params);
    }
}
