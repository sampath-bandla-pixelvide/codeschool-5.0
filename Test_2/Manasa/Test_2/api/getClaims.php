<?php

require_once __DIR__ . "/controllers/ClaimController.php";

$data = json_decode(file_get_contents("php://input"), true);

$claim = new ClaimController();

$response = $claim->getMyClaims($data['owner_id']);

echo json_encode($response);