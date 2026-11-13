<?php
/**
 * USB Storage API Endpoint
 * Compatible with PHP 7.4+
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Auth.php';
require_once dirname(__DIR__) . '/src/UsbManager.php';

header('Content-Type: application/json');
Auth::requireLogin();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'status':
            $isMounted = UsbManager::isMounted();
            $info = $isMounted ? UsbManager::getMountedInfo() : null;
            echo json_encode([
                'success'    => true,
                'is_mounted' => $isMounted,
                'info'       => $info
            ]);
            break;

        case 'devices':
            $devices = UsbManager::getAvailableDevices();
            $isMounted = UsbManager::isMounted();
            $mountedInfo = $isMounted ? UsbManager::getMountedInfo() : null;
            echo json_encode([
                'success'      => true,
                'is_mounted'   => $isMounted,
                'mounted_info' => $mountedInfo,
                'devices'      => $devices
            ]);
            break;

        case 'mount':
            $device = $_POST['device'] ?? '';
            if (empty($device)) {
                echo json_encode(['success' => false, 'error' => 'No se especificó la unidad a montar']);
                exit;
            }
            $result = UsbManager::mount($device);
            if ($result['success']) {
                $user = Auth::user();
                Auth::logActivity((int)$user['id'], 'MOUNT_USB', "Montado dispositivo {$device}");
            }
            echo json_encode($result);
            break;

        case 'unmount':
            $result = UsbManager::unmount();
            if ($result['success']) {
                $user = Auth::user();
                Auth::logActivity((int)$user['id'], 'UNMOUNT_USB', 'Unidad USB desmontada');
            }
            echo json_encode($result);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Acción no válida']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
