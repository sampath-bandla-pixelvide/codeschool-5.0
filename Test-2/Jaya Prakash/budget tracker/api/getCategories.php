<?php
require_once __DIR__ . "/controllers/categoryControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = getTokenFromHeader();

if(!$token){
    die(sendResponse(false,"Invalid token.try again later..."));
}

$categoryControl = new categoryControllers();
echo $categoryControl->getCategories($token);
