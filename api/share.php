<?php
/**
 * Shares API Endpoint
 * Compatible with PHP 7.4+
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Auth.php';
require_once dirname(__DIR__) . '/src/ShareManager.php';

header('Content-Type: application/json');
Auth::requireLogin();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'create':
            $source = $_POST['source'] ?? 'local';
            $path = $_POST['path'] ?? '';
            $password = $_POST['password'] ?? null;
            $expiresHours = !empty($_POST['expires_hours']) ? (int)$_POST['expires_hours'] : null;

            if (empty($path)) {
                echo json_encode(['success' => false, 'error' => 'Ruta no especificada']);
                exit;
            }

            $result = ShareManager::createShare($source, $path, $password, $expiresHours);
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'CREATE_SHARE', "Compartido '{$path}' ({$source})");
            echo json_encode($result);
            break;

        case 'list':
            $shares = ShareManager::listShares();
            echo json_encode(['success' => true, 'shares' => $shares]);
            break;

        case 'delete':
            $token = $_POST['token'] ?? '';
            if (empty($token)) {
                echo json_encode(['success' => false, 'error' => 'Token no especificado']);
                exit;
            }
            $result = ShareManager::deleteShare($token);
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'DELETE_SHARE', "Eliminado enlace compartido '{$token}'");
            echo json_encode(['success' => $result]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Acción no válida']);
            break;
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
