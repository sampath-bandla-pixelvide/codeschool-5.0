<?php
require_once __DIR__ . "/controllers/ContactsControllers.php";

$token = $_POST['userToken'];
$username = $_POST['username'];
$textMessage = $_POST['textmsg'];
$is_media = false;

$contactsControl = new ContactsControllers();
echo $contactsControl->sendMessage($token,$username,$textMessage,$is_media);