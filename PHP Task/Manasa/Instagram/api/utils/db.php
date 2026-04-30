<?php

require_once(__DIR__ . "/../database/pdo.php");

class DB
{
    public $query = '';  //stores SQL query
    private  $pdo = null;   //DB connection
    private $stmt = null; //Prepared statement

    function __construct()
    {
        $this->pdo = getPDO();
    }

    public function query($query)
    {
        $this->query = $query;  //set query
    }

    public function prepare()
    {  //prepared statement
        $this->stmt = $this->pdo->prepare($this->query);
    }

    public function execute($params)
    { //execute
        return $this->stmt->execute($params);
    }

    public function first($params = [])
    {   //fetch single row result
        $this->prepare();
        $this->execute($params);
        return $this->stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function get($params = [])
    { //fetch multiple records
        $this->prepare();
        $this->execute($params);
        return $this->stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($params = [])
    {
        $this->prepare();
        return $this->execute($params);
    }

    public function update($params = [])
    {
        $this->prepare();
        return $this->execute($params);
    }

    public function delete($params = [])
    {
        $this->prepare();
        return $this->execute($params);
    }

    public function lastInsertId()
{
    return $this->pdo->lastInsertId();
}
}
