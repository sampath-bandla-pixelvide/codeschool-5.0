<?php

class ResponseHelper {
    public static function send($success, $message, $data = null, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode([
            "success" => $success,
            "message" => $message,
            "data" => $data
        ]);
        exit;
    }

    public static function error($message, $statusCode = 400) {
        self::send(false, $message, null, $statusCode);
    }

    public static function success($message, $data = null, $statusCode = 200) {
        self::send(true, $message, $data, $statusCode);
    }
}
