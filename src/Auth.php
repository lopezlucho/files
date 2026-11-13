<?php
/**
 * Authentication and User Session Manager
 * Compatible with PHP 7.4+
 */

require_once dirname(__DIR__) . '/config/database.php';

class Auth
{
    public static function check(): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }

    public static function user(): ?array
    {
        if (!self::check()) {
            return null;
        }
        return [
            'id'       => $_SESSION['user_id'],
            'username' => $_SESSION['username'] ?? '',
            'name'     => $_SESSION['name'] ?? '',
            'role'     => $_SESSION['role'] ?? 'admin',
        ];
    }

    public static function requireLogin(): void
    {
        if (!self::check()) {
            if (self::isAjax()) {
                header('Content-Type: application/json');
                http_response_code(401);
                echo json_encode(['success' => false, 'error' => 'Sesión no iniciada o expirada']);
                exit;
            }
            header('Location: ' . BASE_URL . '/login');
            exit;
        }
    }

    public static function isAjax(): bool
    {
        return (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
                strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') ||
               (isset($_SERVER['CONTENT_TYPE']) && 
                strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) ||
               (isset($_SERVER['HTTP_ACCEPT']) && 
                strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);
    }

    public static function login(string $username, string $password): array
    {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('SELECT id, username, password, name, role FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([trim($username)]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            return ['success' => false, 'error' => 'Usuario o contraseña incorrectos'];
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        session_regenerate_id(true);
        $_SESSION['user_id']  = (int)$user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['name']     = $user['name'];
        $_SESSION['role']     = $user['role'];

        self::logActivity((int)$user['id'], 'LOGIN', 'Inicio de sesión exitoso');

        return [
            'success' => true,
            'user'    => [
                'id'       => (int)$user['id'],
                'username' => $user['username'],
                'name'     => $user['name'],
                'role'     => $user['role']
            ]
        ];
    }

    public static function logout(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $userId = $_SESSION['user_id'] ?? null;
        if ($userId) {
            self::logActivity((int)$userId, 'LOGOUT', 'Cierre de sesión');
        }

        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }
        session_destroy();
    }

    public static function changePassword(int $userId, string $oldPassword, string $newPassword): array
    {
        if (strlen($newPassword) < 6) {
            return ['success' => false, 'error' => 'La nueva contraseña debe tener al menos 6 caracteres'];
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('SELECT password FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $hash = $stmt->fetchColumn();

        if (!$hash || !password_verify($oldPassword, $hash)) {
            return ['success' => false, 'error' => 'La contraseña actual no es correcta'];
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $update = $db->prepare('UPDATE users SET password = ? WHERE id = ?');
        $update->execute([$newHash, $userId]);

        self::logActivity($userId, 'CHANGE_PASSWORD', 'Cambio de contraseña realizado');

        return ['success' => true, 'message' => 'Contraseña actualizada con éxito'];
    }

    public static function logActivity(?int $userId, string $action, ?string $details = null): void
    {
        try {
            $db = Database::getInstance()->getConnection();
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $stmt = $db->prepare('INSERT INTO activity_logs (user_id, action, details, ip) VALUES (?, ?, ?, ?)');
            $stmt->execute([$userId, $action, $details, $ip]);
        } catch (Exception $e) {
            // Silently catch logging errors to prevent breaking the main request
        }
    }
}
