<?php

require_once __DIR__."/../Validations/Validation.php";
require_once __DIR__."/../controllers/authController.php";


if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}

$data = $_POST['data'];

registerValidation($data);

$auth = new authController();
$auth->register($data);