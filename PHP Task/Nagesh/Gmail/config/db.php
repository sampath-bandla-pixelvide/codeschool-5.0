<?php

require_once(__DIR__ . "/pdo.php");

class DB {

    private $pdo = null;
    private $stmt = null;

    function __construct()
    {
        $this->pdo = getPDO();   
    }

    public function query($query) {
        $this->stmt = $this->pdo->prepare($query);
        return $this;
    }

    public function execute($params = []) {
        return $this->stmt->execute($params);
    }

    public function first($params = []) {
        $this->execute($params);
        return $this->stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function get($params = []) {
        $this->execute($params);
        return $this->stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($params = []) {
        return $this->execute($params);
    }

    public function update($params = []) {
        return $this->execute($params);
    }

    public function delete($params = []) {
        return $this->execute($params);
    }
}