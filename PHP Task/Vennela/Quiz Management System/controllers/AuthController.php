<?php
// session_start();
// require_once __DIR__ . "/../utils/pdo.php";
// require_once __DIR__ . "/../utils/functions.php";

// class AuthController
// {
//     private $pdo;
//     function __construct()
//     {
//        $this->pdo = getPDO();
//     }
//     public function login($email, $password)
//     {
//         $pdo = $this->pdo;
//         $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
//         $stmt->execute([':email' => $email]);
//         $user = $stmt->fetch(PDO::FETCH_ASSOC);
//         if (!$user) {
//             sendResponse(false, "Email not found");
//         }
//         if ($password !== $user['password']) {
//             sendResponse(false, "Incorrect password");
//         }
//         $_SESSION['user'] = [
//             "id" => $user['id'],
//             "name" => $user['name'],
//             "role" => $user['role']
//         ];
//         $token = $this->getNewToken($user['id']);
//         sendResponse(true, "Login successful", [
//             "role" => $user['role'],
//             "token" => $token
//         ]);
//     }
//     public function getNewToken($userId)
//     {
//     $token = bin2hex(random_bytes(32));

//     $expiryAt = date(
//         'Y-m-d H:i:s',
//         strtotime('+60 minutes')
//     );

//     $insertTokenQuery = "
//         INSERT INTO user_tokens
//         (token, user_id, expires_at)
//         VALUES (:token, :user_id, :expiry)
//     ";

//     $this->pdo->query($insertTokenQuery);

//     $insertStatus = $this->pdo->create([
//         'token' => $token,
//         'user_id' => $userId,
//         'expiry' => $expiryAt
//     ]);

//     if (!$insertStatus) {
//         sendResponse(false,
//             'Something went wrong while logging in!'
//         );
//     }

//     return $token;
// }

// }


if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . "/../utils/pdo.php";
require_once __DIR__ . "/../utils/functions.php";

class AuthController
{
    private $pdo;

    // DATABASE CONNECTION
    public function __construct()
    {
        $this->pdo = getPDO();
    }

    // LOGIN FUNCTION
    public function login($email, $password)
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM users WHERE email = :email"
        );

        $stmt->execute([
            ':email' => $email
        ]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // CHECK USER
        if (!$user) {
            sendResponse(false, "Email not found");
        }

        // CHECK PASSWORD
        if ($password !== $user['password']) {
            sendResponse(false, "Incorrect password");
        }

        // CREATE SESSION
        $_SESSION['user'] = [
            'id' => $user['id'],
            'name' => $user['name'],
            'role' => $user['role']
        ];

        // GENERATE TOKEN
        $token = $this->getNewToken($user['id']);

        // RESPONSE
        sendResponse(true, "Login successful", [
            'id' => $user['id'],
            'name' => $user['name'],
            'role' => $user['role'],
            'token' => $token
        ]);
    }

    // CREATE TOKEN
    public function getNewToken($userId)
    {
        $token = bin2hex(random_bytes(32));

        $expiresAt = date(
            'Y-m-d H:i:s',
            strtotime('+60 minutes')
        );

        $stmt = $this->pdo->prepare("
            INSERT INTO user_tokens
            (token, user_id, expires_at)
            VALUES (:token, :user_id, :expires_at)
        ");

        $insertStatus = $stmt->execute([
            ':token' => $token,
            ':user_id' => $userId,
            ':expires_at' => $expiresAt
        ]);

        if (!$insertStatus) {
            sendResponse(
                false,
                "Something went wrong while creating token"
            );
        }

        return $token;
    }

    // VERIFY TOKEN
    public function verifyToken()
    {
        $headers = getallheaders();

        // CHECK AUTH HEADER
        if (!isset($headers['Authorization'])) {
            sendResponse(false, "Authorization token required");
        }

        // GET TOKEN
        $authHeader = $headers['Authorization'];

        // REMOVE "Bearer "
        $token = trim(
            str_replace('Bearer', '', $authHeader)
        );

        if (empty($token)) {
            sendResponse(false, "Invalid token");
        }

        // CHECK TOKEN IN DATABASE
        $stmt = $this->pdo->prepare("
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

        // TOKEN NOT FOUND
        if (!$tokenData) {
            sendResponse(false, "Token not found");
        }

        // TOKEN EXPIRED
        if (
            strtotime($tokenData['expires_at']) < time()
        ) {
            sendResponse(false, "Token expired");
        }

        // CREATE SESSION
        $_SESSION['user'] = [
            'id' => $tokenData['user_id'],
            'name' => $tokenData['name'],
            'role' => $tokenData['role']
        ];

        return $_SESSION['user'];
    }

    // LOGOUT
    public function logout()
    {
        session_destroy();

        sendResponse(true, "Logout successful");
    }
}