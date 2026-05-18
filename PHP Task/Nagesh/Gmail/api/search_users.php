<?php
require_once("../config/db.php");
require_once("../config/commonfunctions.php");

$q = $_GET['q'] ?? '';
$pattern = $q."%";
$db = new DB();

$db->query("SELECT first_name || ' ' || last_name AS name, email FROM users WHERE email ILIKE :pattern OR first_name ILIKE :pattern LIMIT 5");

$data = $db->get([":pattern" => $pattern]);
echo getResponse(true, "Suggestions", $data);