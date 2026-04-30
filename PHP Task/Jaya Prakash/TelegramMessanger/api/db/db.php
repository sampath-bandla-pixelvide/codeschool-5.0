<?php
require_once __DIR__ . "/pdo.php";

class DB{
    private $query = "";
    private $pdo = null;
    private $statement = null;

    function __construct()
    {
        $this->pdo = getPDO();
    }

    public function query($query){
        $this->query = $query;
        return $this;
    }

    public function execute($params = []){
        $this->statement=$this->pdo->prepare($this->query);
        return $this->statement->execute($params);
    }

    public function get($params=[]){
        $this->execute($params);
        return $this->statement->fetch(PDO::FETCH_ASSOC);
    }

    public function getAll($params=[]){
        $this->execute($params);
        return $this->statement->fetchAll(PDO::FETCH_ASSOC);
    }
}

?>