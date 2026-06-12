<?php
require_once __DIR__ . "/controllers/ContactsControllers.php";

$token = $_POST['userToken'];

$contactsControl = new ContactsControllers();
echo $contactsControl->getUserContacts($token);
