<?php

class TokenHelper {
    public static function generateTripToken() {
        $date = date('Ymd');
        $random = strtoupper(bin2hex(random_bytes(3))); // 6 character hex
        return "ORR-" . $date . "-" . $random;
    }
}
