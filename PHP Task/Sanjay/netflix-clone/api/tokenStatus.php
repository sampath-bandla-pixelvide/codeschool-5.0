<?php

require_once __DIR__ ."/controllers/AuthControllers.php";

$token=$_POST["token"];
$obj=new AuthController();
echo $obj->logout($token);

?>