<?php
require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../helpers/functions.php');

function verifyToken(){
    $headers=getallheaders();
    if(!isset($headers['Authorization'])) sendResponse(false,"Unauthorized");
    $authHeader=$headers['Authorization'];
    if(!preg_match('/Bearer\s(\S+)/',$authHeader,$matches))
        sendResponse(false,"Invalid token format");
    $token=$matches[1];
    $db=new DB();
    $db->query("
        SELECT ut.*, u.id as user_id, u.name, u.email, u.role
        FROM user_tokens ut
        JOIN users u ON u.id = ut.user_id
        WHERE ut.token_hash = :token
        LIMIT 1
    ");
    $session = $db->first(['token' => $token]);
    if (!$session) {
        sendResponse(false, "Invalid token");
    }
    if ($session['expires_at'] && strtotime($session['expires_at']) < time()) {
        sendResponse(false, "Session expired");
    }
    return [
        "id" => $session['user_id'],
        "name" => $session['name'],
        "email" => $session['email'],
        "role" => $session['role']
    ];
}
function checkAdmin($user){
    if($user['role']!=='admin'){
        sendResponse(false, "Access denied. Admins only.");
    }
}