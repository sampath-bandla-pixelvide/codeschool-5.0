<?php
require_once __DIR__ . "/controllers/ContactsControllers.php";

$file = $_FILES['image'];
$token = $_POST['userToken'];
$username = $_POST['username'];

if($file['error']){
    die(sendResponse(false,"file not uploaded"));
}

$filename = time() . "_" . $file['name'];
if(!move_uploaded_file($file['tmp_name'], "../uploads/" . $filename)){
    die(sendResponse(false,"failed to save the file"));
}
$is_media = true;

$contactsControl = new ContactsControllers();
echo $contactsControl->sendMessage($token,$username,$filename,$is_media);
