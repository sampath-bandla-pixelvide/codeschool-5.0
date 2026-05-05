<?php
  require_once("./utils/functions.php");
  require_once __DIR__ . "/controllers/dashboardController.php";

  $user_id = $_GET["user_id"] ?? null;

  if (!$user_id) {
    sendResponse(false, "User ID missing");
    exit;
}

    
  $dashboard = new dashboardController();
  $user = $dashboard->getUser($user_id);

  if (!$user) {
    sendResponse(false, "User not found", []);
    exit;
} 

  sendResponse(true,"user login",$user);
