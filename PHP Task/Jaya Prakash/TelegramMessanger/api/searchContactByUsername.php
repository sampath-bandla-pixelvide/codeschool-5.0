<?php
require_once __DIR__ . "/controllers/AuthControllers.php";
require_once __DIR__ . "/controllers/ContactsControllers.php";
require_once __DIR__ . "/utils/functions.php";

$searchInput = $_POST['searchInput'];
$token = $_POST['userToken'];

//validate
if(empty($searchInput)){
    die(sendResponse(false,"no search input"));
}
$contactsControl = new ContactsControllers();
echo $contactsControl->searchContactByUsername($searchInput,$token);
