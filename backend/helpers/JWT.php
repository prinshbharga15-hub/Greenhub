<?php
class JWT {
    private static function getSecret() {
        $secret = getenv('JWT_SECRET');
        if (!$secret) {
            $secret = 'greenhub_dev_' . md5(__DIR__);
        }
        return $secret;
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public static function encode($payload, $tokenVersion = null) {
        $header = self::base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        
        $payload['iss'] = 'greenhub';
        $payload['aud'] = 'greenhub-api';
        $payload['iat'] = time();
        $payload['exp'] = time() + 86400;
        if ($tokenVersion !== null) {
            $payload['tv'] = $tokenVersion;
        }
        
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        $signature = self::base64UrlEncode(hash_hmac('sha256', "$header.$payloadEncoded", self::getSecret(), true));
        return "$header.$payloadEncoded.$signature";
    }

    public static function decode($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        list($header, $payload, $signature) = $parts;

        $headerData = json_decode(self::base64UrlDecode($header), true);
        if (!$headerData || !isset($headerData['alg']) || $headerData['alg'] !== 'HS256') {
            return null;
        }

        $expectedSignature = self::base64UrlEncode(hash_hmac('sha256', "$header.$payload", self::getSecret(), true));

        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        $data = json_decode(self::base64UrlDecode($payload), true);
        if (!$data) return null;

        if (isset($data['exp']) && $data['exp'] < time()) {
            return null;
        }

        if (!isset($data['iss']) || $data['iss'] !== 'greenhub') return null;
        if (!isset($data['aud']) || $data['aud'] !== 'greenhub-api') return null;

        return $data;
    }
}
