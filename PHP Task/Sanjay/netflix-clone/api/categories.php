<?php

require_once __DIR__ . "/controllers/AuthControllers.php";


$category=$_POST["category"];
$obj=new AuthController();

echo $obj->fetchCategory($category);