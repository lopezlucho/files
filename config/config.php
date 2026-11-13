<?php
/**
 * Configuration file for Cloud File Manager
 * Compatible with PHP 7.4+
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'lucho');
define('DB_PASS', 'arcadia');
define('DB_NAME', 'files_db');
define('DB_PORT', 3306);
define('DB_CHARSET', 'utf8mb4');

// System Paths
define('ROOT_PATH', dirname(__DIR__));
define('STORAGE_PATH', ROOT_PATH . '/storage');
define('USB_MOUNT_PATH', '/media/usb');
define('BASE_URL', '/files');

// Application Settings
define('APP_NAME', 'Cloud Files');
define('APP_VERSION', '1.0.0');

// Maximum upload chunk/execution settings
ini_set('max_execution_time', '300');
ini_set('memory_limit', '256M');

// Autoload helper for classes in src/
spl_autoload_register(function ($class) {
    $file = ROOT_PATH . '/src/' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});
