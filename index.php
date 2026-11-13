<?php
/**
 * Main Application Router & Controller
 * Compatible with PHP 7.4+
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/src/Auth.php';
require_once __DIR__ . '/src/UsbManager.php';
require_once __DIR__ . '/src/FileManager.php';
require_once __DIR__ . '/src/ShareManager.php';

// Detect URL path routing (e.g. /files/login)
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$relativeUri = str_replace(BASE_URL, '', $requestUri);
$relativeUri = trim($relativeUri, '/');

$view = $_GET['view'] ?? '';
if ($relativeUri === 'login' || $view === 'login') {
    if (Auth::check()) {
        header('Location: ' . BASE_URL . '/');
        exit;
    }
    require_once __DIR__ . '/views/auth/login.php';
    exit;
}

// Check authentication
if (!Auth::check()) {
    header('Location: ' . BASE_URL . '/login');
    exit;
}

// Router for authenticated views
$source = $_GET['source'] ?? 'local';
if ($source !== 'usb') {
    $source = 'local';
}

switch ($view) {
    case 'usb':
        $pageTitle = 'Gestión de Dispositivos USB';
        $contentView = __DIR__ . '/views/usb/index.php';
        break;

    case 'shares':
        $pageTitle = 'Enlaces Compartidos';
        $contentView = __DIR__ . '/views/shares/index.php';
        break;

    case 'files':
    default:
        $pageTitle = ($source === 'usb') ? 'Archivos en USB' : 'Gestor de Archivos';
        $contentView = __DIR__ . '/views/files/index.php';
        break;
}

// Render master layout
require_once __DIR__ . '/views/layout/header.php';
require_once __DIR__ . '/views/layout/navbar.php';
require_once __DIR__ . '/views/layout/sidebar.php';

echo '<div class="content-wrapper">';
require_once $contentView;
echo '</div>';

require_once __DIR__ . '/views/layout/footer.php';
