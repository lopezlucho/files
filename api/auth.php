<?php
/**
 * Authentication API Endpoint
 * Compatible with PHP 7.4+
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Auth.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'login':
            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';
            if (empty($username) || empty($password)) {
                echo json_encode(['success' => false, 'error' => 'Por favor complete todos los campos']);
                exit;
            }
            $result = Auth::login($username, $password);
            echo json_encode($result);
            break;

        case 'logout':
            Auth::logout();
            echo json_encode(['success' => true]);
            break;

        case 'password':
            Auth::requireLogin();
            $user = Auth::user();
            $oldPassword = $_POST['old_password'] ?? '';
            $newPassword = $_POST['new_password'] ?? '';
            $result = Auth::changePassword((int)$user['id'], $oldPassword, $newPassword);
            echo json_encode($result);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Acción no reconocida']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
