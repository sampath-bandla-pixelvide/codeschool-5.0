<?php

require_once __DIR__ . "/controllers/addressController.php";

$controller = new addressController();

$controller->createAddress(
  $_POST['user_id'],
  $_POST['address_line'],
  $_POST['city'],
  $_POST['state'],
  $_POST['country'],
  $_POST['pincode']
);
