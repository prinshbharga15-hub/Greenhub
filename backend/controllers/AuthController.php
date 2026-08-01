<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/JWT.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AuthController {
    public static function register($data) {
        $name = isset($data['name']) ? trim($data['name']) : '';
        $email = isset($data['email']) ? trim($data['email']) : '';
        $password = isset($data['password']) ? $data['password'] : '';

        if (empty($name) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'All fields (name, email, password) are required.']);
            return;
        }

        if (strlen($password) < 8) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 8 characters long.']);
            return;
        }
        if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must contain at least one letter and one number.']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email address.']);
            return;
        }

        $existingUser = Database::findOne('users', ['email' => $email]);
        if ($existingUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Unable to create account. Please try a different email or contact support.']);
            return;
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        
        $newUser = [
            'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
            'email' => $email,
            'passwordHash' => $passwordHash,
            'role' => 'user',
            'phone' => isset($data['phone']) ? trim($data['phone']) : '',
            'address' => isset($data['address']) ? trim($data['address']) : '',
            'createdAt' => new DateTime()
        ];

        $inserted = Database::insertOne('users', $newUser);

        if (!$inserted) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user.']);
            return;
        }

        $userId = $inserted['_id'];
        $payload = [
            'userId' => $userId,
            'email' => $email,
            'role' => 'user',
            'exp' => time() + (24 * 60 * 60)
        ];

        $token = JWT::encode($payload);

        echo json_encode([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'role' => 'user',
                'phone' => $newUser['phone'],
                'address' => $newUser['address']
            ]
        ]);
    }

    public static function login($data) {
        $email = isset($data['email']) ? trim($data['email']) : '';
        $password = isset($data['password']) ? $data['password'] : '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required.']);
            return;
        }

        $user = Database::findOne('users', ['email' => $email]);
        if (!$user || !password_verify($password, $user['passwordHash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password.']);
            return;
        }

        $userId = $user['_id'];
        $payload = [
            'userId' => $userId,
            'email' => $user['email'],
            'role' => $user['role'],
            'exp' => time() + (24 * 60 * 60)
        ];

        $token = JWT::encode($payload);

        echo json_encode([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'phone' => isset($user['phone']) ? $user['phone'] : '',
                'address' => isset($user['address']) ? $user['address'] : ''
            ]
        ]);
    }

    public static function me() {
        $user = AuthMiddleware::requireAuth();
        echo json_encode([
            'user' => [
                'id' => $user['_id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'phone' => isset($user['phone']) ? $user['phone'] : '',
                'address' => isset($user['address']) ? $user['address'] : ''
            ]
        ]);
    }

    public static function forgotPassword($data) {
        $email = isset($data['email']) ? trim($data['email']) : '';
        if (empty($email)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email is required.']);
            return;
        }

        $user = Database::findOne('users', ['email' => $email]);
        $resetToken = null;
        if ($user) {
            $resetToken = bin2hex(random_bytes(16));
            Database::updateOne('users', ['_id' => $user['_id']], [
                '$set' => [
                    'resetToken' => $resetToken,
                    'resetTokenExp' => time() + 3600
                ]
            ]);
        }

        echo json_encode([
            'message' => 'If an account exists with this email, password reset instructions have been sent.',
            'resetToken' => $resetToken
        ]);
    }

    public static function resetPassword($data) {
        $token = isset($data['token']) ? trim($data['token']) : '';
        $newPassword = isset($data['newPassword']) ? $data['newPassword'] : '';

        if (empty($token) || empty($newPassword)) {
            http_response_code(400);
            echo json_encode(['error' => 'Token and new password are required.']);
            return;
        }

        if (strlen($newPassword) < 8) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 8 characters long.']);
            return;
        }
        if (!preg_match('/[A-Za-z]/', $newPassword) || !preg_match('/[0-9]/', $newPassword)) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must contain at least one letter and one number.']);
            return;
        }

        $user = Database::findOne('users', [
            'resetToken' => $token,
            'resetTokenExp' => ['$gt' => time()]
        ]);

        if (!$user) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or expired reset token.']);
            return;
        }

        $newPasswordHash = password_hash($newPassword, PASSWORD_BCRYPT);
        Database::updateOne('users', ['_id' => $user['_id']], [
            '$set' => [
                'passwordHash' => $newPasswordHash
            ],
            '$unset' => [
                'resetToken' => '',
                'resetTokenExp' => ''
            ]
        ]);

        echo json_encode(['message' => 'Password reset successfully. You can now login.']);
    }

    public static function updateProfile($data) {
        $user = AuthMiddleware::requireAuth();
        
        $updateData = [];
        if (isset($data['name'])) $updateData['name'] = htmlspecialchars(trim($data['name']), ENT_QUOTES, 'UTF-8');
        if (isset($data['phone'])) $updateData['phone'] = htmlspecialchars(trim($data['phone']), ENT_QUOTES, 'UTF-8');
        if (isset($data['address'])) $updateData['address'] = htmlspecialchars(trim($data['address']), ENT_QUOTES, 'UTF-8');

        if (empty($updateData)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update.']);
            return;
        }

        Database::updateOne('users', ['_id' => $user['_id']], [
            '$set' => $updateData
        ]);

        $updatedUser = Database::findOne('users', ['_id' => $user['_id']]);

        echo json_encode([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $updatedUser['_id'],
                'name' => $updatedUser['name'],
                'email' => $updatedUser['email'],
                'role' => $updatedUser['role'],
                'phone' => isset($updatedUser['phone']) ? $updatedUser['phone'] : '',
                'address' => isset($updatedUser['address']) ? $updatedUser['address'] : ''
            ]
        ]);
    }
}
