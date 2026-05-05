<?php
require_once __DIR__ . "/controllers/ContactsControllers.php";

$token = $_POST['userToken'];
$username = $_POST['username'];

$contactControl = new ContactsControllers();
echo $contactControl->getChatContent($token,$username);