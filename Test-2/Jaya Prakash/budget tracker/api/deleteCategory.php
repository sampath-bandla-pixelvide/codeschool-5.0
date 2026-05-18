<?php
require_once __DIR__ . "/controllers/categoryControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = getTokenFromHeader();
$category_id = $_POST['id'];

if(!$token){
    die(sendResponse(false,"Invalid token.try again later..."));
}

$categoryControl = new categoryControllers();
echo $categoryControl->deleteCategory($category_id, $token);
