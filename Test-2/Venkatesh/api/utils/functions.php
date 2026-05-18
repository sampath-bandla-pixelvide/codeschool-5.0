<?php

function sendResponse($status, $message = "Success", $data = null)
{
    header("Content-Type: application/json");
    echo json_encode([
        "status" => $status,
        "message" => $message,
        "data" => $data
    ]);
    exit();
}
