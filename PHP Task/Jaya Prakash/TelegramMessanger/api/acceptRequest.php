<?php
require_once __DIR__ . "/controllers/ContactsControllers.php";

$token = $_POST['userToken'];
$username = $_POST['username'];

//validations
$contactsControl = new ContactsControllers();
echo $contactsControl->acceptRequest($token,$username);