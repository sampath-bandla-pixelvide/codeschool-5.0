<?php
require_once(__DIR__ . "/pdo.php");
class DB{
    private $pdo;
    private $stmt;
    public function __construct()
    {
        $this->pdo=getPDO();
    }
    public function query($query){ //prepare
        $this->stmt=$this->pdo->prepare($query);
        return $this;
    }
    public function execute($params=[]){
        return $this->stmt->execute($params);
    }
    public function first($params=[]){
        $this->execute($params);  //this execute is above function not pdo's
        return $this->stmt->fetch();
    }
    public function get($params=[]){
        $this->execute($params);
        return $this->stmt->fetchAll();
    }
    public function run($query,$params=[]){
        return $this->query($query)->execute($params);
    }

}