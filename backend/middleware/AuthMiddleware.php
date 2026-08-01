<?php
require_once __DIR__ . '/../helpers/JWT.php';
require_once __DIR__ . '/../config/db.php';

class AuthMiddleware {
    public static function getAuthenticatedUser() {
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        if (empty($authHeader) && isset($headers['authorization'])) {
            $authHeader = $headers['authorization'];
        }

        if (empty($authHeader)) {
            return null;
        }

        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
            $payload = JWT::decode($token);
            if ($payload && isset($payload['userId'])) {
                $user = Database::findOne('users', ['_id' => $payload['userId']]);
                if ($user) {
                    // Check token version for invalidation
                    if (isset($payload['tv']) && isset($user['tokenVersion'])) {
                        if ((int)$payload['tv'] !== (int)$user['tokenVersion']) {
                            return null;
                        }
                    }
                    return $user;
                }
            }
        }

        return null;
    }

    public static function requireAuth() {
        $user = self::getAuthenticatedUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized. Please login first.']);
            exit;
        }
        return $user;
    }

    public static function requireAdmin() {
        $user = self::requireAuth();
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden. Admin access required.']);
            exit;
        }
        return $user;
    }
}
