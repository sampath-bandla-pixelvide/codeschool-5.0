<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . "/pdo.php";

function sendResponse($status, $message, $data = [])
{
    echo json_encode([
        "status" => $status,
        "message" => $message,
        "data" => $data
    ]);

    exit;
}

function verifyToken()
{
    $pdo = getPDO();

    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        sendResponse(false, "Token required");
    }

    $authHeader = $headers['Authorization'];

    $token = trim(
        str_replace('Bearer', '', $authHeader)
    );

    if (empty($token)) {
        sendResponse(false, "Invalid token");
    }
    $stmt = $pdo->prepare("
        SELECT ut.*, u.name, u.role
        FROM user_tokens ut
        INNER JOIN users u
        ON u.id = ut.user_id
        WHERE ut.token = :token
        LIMIT 1
    ");

    $stmt->execute([
        ':token' => $token
    ]);

    $tokenData = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$tokenData) {
        sendResponse(false, "Token not found");
    }
    if (
        strtotime($tokenData['expires_at']) < time()
    ) {
        sendResponse(false, "Token expired");
    }

    $_SESSION['user'] = [
        'id' => $tokenData['user_id'],
        'name' => $tokenData['name'],
        'role' => $tokenData['role']
    ];

    return $_SESSION['user'];
}