<?php

require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../controllers/AuthController.php');


$field = $_GET['field'] ?? '';
$value = $_GET['value'] ?? '';

$auth = new AuthController();

$result = $auth->checkFieldAvailability($field, $value);

sendResponse(true, "Success", ["exists" => $result]);