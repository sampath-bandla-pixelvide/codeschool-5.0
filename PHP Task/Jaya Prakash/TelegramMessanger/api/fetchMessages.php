<?php
require_once __DIR__ . "/controllers/ContactsControllers.php";
$token = $_POST['userToken'];
$username = $_POST['username'];

$contactsControl = new ContactsControllers();
echo $contactsControl->fetchMessages($token,$username);