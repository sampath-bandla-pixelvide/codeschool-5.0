<?php

  require_once("./utils/functions.php");
  require_once __DIR__ . '/controllers/productsController.php';

  $method = $_SERVER['REQUEST_METHOD'];

  $user = new productsController();

  if ($method === "GET") {
      $users = $user->getUsers();
      echo json_encode($users);
      exit;
  }
