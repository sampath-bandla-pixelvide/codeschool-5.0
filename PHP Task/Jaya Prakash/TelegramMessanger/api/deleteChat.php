<?php
require_once __DIR__ . "/controllers/ContactsControllers.php";

$username = $_POST['currentUser'];
$token = $_POST['userToken'];

$contactsControl = new ContactsControllers();
echo $contactsControl->deleteChat($token,$username);