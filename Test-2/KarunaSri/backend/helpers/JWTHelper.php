<?php

class JWTHelper {
    private static $secret = "orr_toll_system_secret_key_2026";

    public static function generateToken($payload) {
        $header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'])));
        $payload['exp'] = time() + 86400; // 24 hours
        $payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
        $signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(hash_hmac('sha256', "$header.$payload", self::$secret, true)));
        return "$header.$payload.$signature";
    }

    public static function verifyToken($token) {
        $p = explode('.', $token);
        if (count($p) !== 3) return false;
        
        $sig = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(hash_hmac('sha256', "$p[0].$p[1]", self::$secret, true)));
        if ($sig !== $p[2]) return false;
        
        $data = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $p[1])), true);
        return (isset($data['exp']) && $data['exp'] < time()) ? false : $data;
    }
}
