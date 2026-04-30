<?php
require_once __DIR__ . "/controllers/ContactsControllers.php";
$token = $_POST['userToken'];
$username = $_POST['currentUser'];

$contactsControl = new ContactsControllers();
echo $contactsControl->deleteContact($token,$username);