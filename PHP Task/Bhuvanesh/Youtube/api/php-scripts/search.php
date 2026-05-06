<?php
require __DIR__.'/../controllers/dataController.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, "POST method only");
}

$search = $_POST["search"];
$data = new dataController();
$data->search($search);


