<?php 
require_once __DIR__ . "/controllers/UserControllers.php";

$address = $_POST['address'];
$city = $_POST['city'];
$state = $_POST['state'];
$pincode = $_POST['pincode'];
$country = $_POST['country'];
$token = $_POST['userToken'];

$userControl = new UserControllers();
echo $userControl->addUserAddress($token,$address,$city,$state,$pincode,$country);