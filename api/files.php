<?php
/**
 * Files Management API Endpoint
 * Compatible with PHP 7.4+
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Auth.php';
require_once dirname(__DIR__) . '/src/FileManager.php';

Auth::requireLogin();

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$source = $_GET['source'] ?? $_POST['source'] ?? 'local';
if ($source !== 'usb') {
    $source = 'local';
}

$path = $_GET['path'] ?? $_POST['path'] ?? '';

try {
    switch ($action) {
        case 'list':
            header('Content-Type: application/json');
            $data = FileManager::listDirectory($source, $path);
            $stats = null;
            try {
                $stats = FileManager::getDiskStats($source);
            } catch (Exception $e) {
                // Ignore stats error if unmounted
            }
            $data['success'] = true;
            $data['stats']   = $stats;
            echo json_encode($data);
            break;

        case 'mkdir':
            header('Content-Type: application/json');
            $name = $_POST['name'] ?? '';
            $result = FileManager::createFolder($source, $path, $name);
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'CREATE_FOLDER', "Carpeta '{$name}' en {$source}:/{$path}");
            echo json_encode($result);
            break;

        case 'upload':
            header('Content-Type: application/json');
            if (empty($_FILES['file'])) {
                echo json_encode(['success' => false, 'error' => 'No se recibió ningún archivo']);
                exit;
            }
            $result = FileManager::uploadFile($source, $path, $_FILES['file']);
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'UPLOAD_FILE', "Archivo '{$result['filename']}' en {$source}:/{$path}");
            echo json_encode($result);
            break;

        case 'rename':
            header('Content-Type: application/json');
            $newName = $_POST['new_name'] ?? '';
            $result = FileManager::renameItem($source, $path, $newName);
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'RENAME_ITEM', "Renombrado '{$path}' a '{$newName}' en {$source}");
            echo json_encode($result);
            break;

        case 'delete':
            header('Content-Type: application/json');
            $result = FileManager::deleteItem($source, $path);
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'DELETE_ITEM', "Eliminado '{$path}' en {$source}");
            echo json_encode($result);
            break;

        case 'download':
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'DOWNLOAD_FILE', "Descargado '{$path}' de {$source}");
            FileManager::downloadFile($source, $path);
            break;

        case 'zip':
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'DOWNLOAD_ZIP', "Descarga comprimida de '{$path}' de {$source}");
            FileManager::zipAndDownloadFolder($source, $path);
            break;

        case 'preview':
            $fullPath = FileManager::resolvePath($source, $path);
            if (!is_file($fullPath)) {
                http_response_code(404);
                die('Archivo no encontrado');
            }

            $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
            $previewType = FileManager::getPreviewType($ext);

            if ($previewType === 'text') {
                header('Content-Type: application/json');
                $previewData = FileManager::readFilePreview($source, $path);
                $previewData['success'] = true;
                $previewData['type']    = 'text';
                echo json_encode($previewData);
                exit;
            }

            if ($previewType === 'zip') {
                header('Content-Type: application/json');
                $zipData = FileManager::listZipContents($source, $path);
                $zipData['type'] = 'zip';
                echo json_encode($zipData);
                exit;
            }

            // Binary inline preview (images, PDF, audio, video)
            while (ob_get_level()) {
                ob_end_clean();
            }

            $mime = FileManager::getMimeType($fullPath);
            $size = filesize($fullPath);
            $filename = basename($fullPath);

            header('Content-Type: ' . $mime);
            header('Content-Disposition: inline; filename="' . rawurlencode($filename) . '"');
            header('Content-Length: ' . $size);
            header('Cache-Control: private, max-age=3600');

            $fp = fopen($fullPath, 'rb');
            if ($fp !== false) {
                fpassthru($fp);
                fclose($fp);
            }
            exit;

        case 'stats':
            header('Content-Type: application/json');
            $stats = FileManager::getDiskStats($source);
            echo json_encode(['success' => true, 'stats' => $stats]);
            break;

        case 'copy_batch':
            header('Content-Type: application/json');
            $srcSource = $_POST['src_source'] ?? 'local';
            $destSource = $_POST['dest_source'] ?? 'local';
            $destPath = $_POST['dest_path'] ?? '';
            $rawItems = $_POST['items'] ?? [];
            $items = is_array($rawItems) ? $rawItems : json_decode($rawItems, true);

            if (empty($items) || !is_array($items)) {
                echo json_encode(['success' => false, 'error' => 'No se seleccionaron elementos para copiar']);
                exit;
            }

            $result = FileManager::copyBatch($srcSource, $items, $destSource, $destPath);
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'COPY_BATCH', "Copiados " . count($items) . " elementos de {$srcSource} a {$destSource}:/{$destPath}");
            echo json_encode($result);
            break;

        case 'move_batch':
            header('Content-Type: application/json');
            $srcSource = $_POST['src_source'] ?? 'local';
            $destSource = $_POST['dest_source'] ?? 'local';
            $destPath = $_POST['dest_path'] ?? '';
            $rawItems = $_POST['items'] ?? [];
            $items = is_array($rawItems) ? $rawItems : json_decode($rawItems, true);

            if (empty($items) || !is_array($items)) {
                echo json_encode(['success' => false, 'error' => 'No se seleccionaron elementos para mover']);
                exit;
            }

            $result = FileManager::moveBatch($srcSource, $items, $destSource, $destPath);
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'MOVE_BATCH', "Movidos " . count($items) . " elementos de {$srcSource} a {$destSource}:/{$destPath}");
            echo json_encode($result);
            break;

        case 'delete_batch':
            header('Content-Type: application/json');
            $rawItems = $_POST['items'] ?? [];
            $items = is_array($rawItems) ? $rawItems : json_decode($rawItems, true);

            if (empty($items) || !is_array($items)) {
                echo json_encode(['success' => false, 'error' => 'No se seleccionaron elementos para eliminar']);
                exit;
            }

            $result = FileManager::deleteBatch($source, $items);
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'DELETE_BATCH', "Eliminados " . count($items) . " elementos de {$source}");
            echo json_encode($result);
            break;

        case 'read_edit':
            header('Content-Type: application/json');
            $data = FileManager::readFileForEdit($source, $path);
            echo json_encode($data);
            break;

        case 'save_edit':
            header('Content-Type: application/json');
            $content = $_POST['content'] ?? '';
            $result = FileManager::saveFileContent($source, $path, $content);
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'SAVE_FILE', "Editado archivo '{$path}' en {$source}");
            echo json_encode($result);
            break;

        case 'create_zip':
            header('Content-Type: application/json');
            $currentPath = $_POST['current_path'] ?? '';
            $zipName = $_POST['zip_name'] ?? '';
            $rawItems = $_POST['items'] ?? [];
            $items = is_array($rawItems) ? $rawItems : json_decode($rawItems, true);

            if (empty($items) || !is_array($items)) {
                echo json_encode(['success' => false, 'error' => 'No se seleccionaron elementos para comprimir']);
                exit;
            }

            $result = FileManager::createZip($source, $items, $currentPath, $zipName);
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'CREATE_ZIP', "Creado archivo ZIP '{$result['filename']}' en {$source}:/{$currentPath}");
            echo json_encode($result);
            break;

        case 'extract_zip':
            header('Content-Type: application/json');
            $zipPath = $_POST['zip_path'] ?? '';
            $destSource = $_POST['dest_source'] ?? $source;
            $destPath = $_POST['dest_path'] ?? '';

            if (empty($zipPath)) {
                echo json_encode(['success' => false, 'error' => 'No se especificó el archivo ZIP a descomprimir']);
                exit;
            }

            $result = FileManager::extractZip($source, $zipPath, $destSource, $destPath);
            $user = Auth::user();
            Auth::logActivity((int)$user['id'], 'EXTRACT_ZIP', "Extraído ZIP '{$zipPath}' en {$destSource}:/{$destPath}");
            echo json_encode($result);
            break;

        case 'list_zip':
            header('Content-Type: application/json');
            $zipPath = $_GET['zip_path'] ?? $_POST['zip_path'] ?? '';
            if (empty($zipPath)) {
                echo json_encode(['success' => false, 'error' => 'No se especificó el archivo ZIP']);
                exit;
            }
            $result = FileManager::listZipContents($source, $zipPath);
            echo json_encode($result);
            break;

        default:
            header('Content-Type: application/json');
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Acción no válida']);
            break;
    }
} catch (Exception $e) {
    if (!headers_sent()) {
        header('Content-Type: application/json');
        http_response_code(400);
    }
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
