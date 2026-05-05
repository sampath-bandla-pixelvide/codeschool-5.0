<?php
require_once __DIR__ . "/controllers/ContactsControllers.php";

$username = $_POST['username'];
$token = $_POST['userToken'];

// validate;
$contactControl = new ContactsControllers();
echo $contactControl->sendFriendRequest($username,$token);