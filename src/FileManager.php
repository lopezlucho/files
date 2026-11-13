<?php
/**
 * File and Directory Operations Manager
 * Compatible with PHP 7.4+
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once __DIR__ . '/UsbManager.php';

class FileManager
{
    /**
     * Get the root directory for the given source ('local' or 'usb')
     */
    public static function getBasePath(string $source): string
    {
        if ($source === 'usb') {
            if (!UsbManager::isMounted()) {
                throw new Exception('La unidad USB no se encuentra montada.');
            }
            return rtrim(USB_MOUNT_PATH, '/');
        }
        return rtrim(STORAGE_PATH, '/');
    }

    /**
     * Safely resolve and validate a relative path within the base storage directory
     */
    public static function resolvePath(string $source, string $relativePath = ''): string
    {
        $base = self::getBasePath($source);

        // Normalize path
        $relativePath = str_replace('\\', '/', $relativePath);
        $relativePath = trim($relativePath, '/');

        // Prevent path traversal attacks
        $parts = explode('/', $relativePath);
        $safeParts = [];
        foreach ($parts as $part) {
            $part = trim($part);
            if ($part === '' || $part === '.') {
                continue;
            }
            if ($part === '..') {
                throw new Exception('Acceso no autorizado: ruta inválida.');
            }
            if (strpos($part, "\0") !== false) {
                throw new Exception('Acceso no autorizado: caracter nulo detectado.');
            }
            $safeParts[] = $part;
        }

        $cleanRelative = implode('/', $safeParts);
        $fullPath = $cleanRelative !== '' ? ($base . '/' . $cleanRelative) : $base;

        // Verify that path stays within base directory
        $realBase = realpath($base);
        if ($realBase === false) {
            throw new Exception('El directorio base de almacenamiento no existe o no es accesible.');
        }

        if (file_exists($fullPath)) {
            $realFull = realpath($fullPath);
            if ($realFull === false || (strpos($realFull, $realBase) !== 0 && $realFull !== $realBase)) {
                throw new Exception('Acceso denegado: intento de salida de directorio.');
            }
            return $realFull;
        }

        // For paths that might not exist yet (e.g. creating new folder or uploading new file)
        $parent = dirname($fullPath);
        $realParent = realpath($parent);
        if ($realParent === false || (strpos($realParent, $realBase) !== 0 && $realParent !== $realBase)) {
            throw new Exception('Acceso denegado: ruta padre fuera del almacenamiento permitido.');
        }

        return $fullPath;
    }

    /**
     * List all items in a directory
     */
    public static function listDirectory(string $source, string $relativePath = ''): array
    {
        $fullPath = self::resolvePath($source, $relativePath);

        if (!is_dir($fullPath)) {
            throw new Exception('La ruta solicitada no es un directorio válido.');
        }

        $items = [];
        $entries = scandir($fullPath);

        if ($entries === false) {
            throw new Exception('No se pudo leer el contenido del directorio.');
        }

        $cleanRelative = trim(str_replace('\\', '/', $relativePath), '/');

        foreach ($entries as $entry) {
            // Skip current, parent and hidden/system metadata files
            if ($entry === '.' || $entry === '..' || $entry === '.htaccess' || $entry === '$RECYCLE.BIN' || $entry === 'System Volume Information') {
                continue;
            }

            $itemFullPath = $fullPath . '/' . $entry;
            $isDir = is_dir($itemFullPath);
            $itemRelPath = $cleanRelative !== '' ? ($cleanRelative . '/' . $entry) : $entry;
            $size = $isDir ? 0 : (@filesize($itemFullPath) ?: 0);
            $mtime = @filemtime($itemFullPath) ?: time();
            $ext = $isDir ? '' : strtolower(pathinfo($entry, PATHINFO_EXTENSION));

            $items[] = [
                'name'          => $entry,
                'path'          => $itemRelPath,
                'is_dir'        => $isDir,
                'size'          => $size,
                'size_h'        => $isDir ? '-' : self::formatBytes($size),
                'modified'      => date('Y-m-d H:i:s', $mtime),
                'modified_h'    => date('d/m/Y H:i', $mtime),
                'ext'           => $ext,
                'mime'          => $isDir ? 'directory' : self::getMimeType($itemFullPath),
                'icon'          => self::getIconClass($isDir, $ext),
                'is_previewable'=> !$isDir && self::isPreviewable($ext),
                'preview_type'  => self::getPreviewType($ext),
            ];
        }

        // Sort: directories first, then alphabetically
        usort($items, function ($a, $b) {
            if ($a['is_dir'] !== $b['is_dir']) {
                return $a['is_dir'] ? -1 : 1;
            }
            return strcasecmp($a['name'], $b['name']);
        });

        // Compute breadcrumbs
        $breadcrumbs = [['name' => ($source === 'usb' ? 'USB' : 'Inicio'), 'path' => '']];
        if ($cleanRelative !== '') {
            $parts = explode('/', $cleanRelative);
            $accum = '';
            foreach ($parts as $p) {
                $accum = $accum !== '' ? ($accum . '/' . $p) : $p;
                $breadcrumbs[] = [
                    'name' => $p,
                    'path' => $accum
                ];
            }
        }

        return [
            'source'      => $source,
            'current_path'=> $cleanRelative,
            'breadcrumbs' => $breadcrumbs,
            'items'       => $items,
            'count'       => count($items),
        ];
    }

    /**
     * Create a new folder
     */
    public static function createFolder(string $source, string $relativePath, string $folderName): array
    {
        $folderName = trim($folderName);
        if ($folderName === '') {
            throw new Exception('El nombre de la carpeta no puede estar vacío.');
        }

        // Disallow dangerous characters
        if (preg_match('#[\\\\/:*?"<>|]#', $folderName)) {
            throw new Exception('El nombre contiene caracteres inválidos (\ / : * ? " < > |).');
        }

        $parentPath = self::resolvePath($source, $relativePath);
        if (!is_dir($parentPath)) {
            throw new Exception('El directorio destino no existe.');
        }

        $targetPath = $parentPath . '/' . $folderName;
        if (file_exists($targetPath)) {
            throw new Exception('Ya existe un archivo o carpeta con ese nombre.');
        }

        if (!@mkdir($targetPath, 0775, false)) {
            $lastErr = error_get_last();
            throw new Exception('No se pudo crear la carpeta: ' . ($lastErr['message'] ?? 'Error de permisos.'));
        }

        return [
            'success' => true,
            'message' => 'Carpeta creada exitosamente',
            'name'    => $folderName,
        ];
    }

    /**
     * Upload one or multiple files
     */
    public static function uploadFile(string $source, string $relativePath, array $file): array
    {
        $targetDir = self::resolvePath($source, $relativePath);
        if (!is_dir($targetDir)) {
            throw new Exception('El directorio destino no existe.');
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors = [
                UPLOAD_ERR_INI_SIZE   => 'El archivo excede el tamaño máximo permitido por el servidor.',
                UPLOAD_ERR_FORM_SIZE  => 'El archivo excede el tamaño máximo permitido por el formulario.',
                UPLOAD_ERR_PARTIAL    => 'El archivo sólo fue subido parcialmente.',
                UPLOAD_ERR_NO_FILE    => 'No se subió ningún archivo.',
                UPLOAD_ERR_NO_TMP_DIR => 'Falta la carpeta temporal en el servidor.',
                UPLOAD_ERR_CANT_WRITE => 'No se pudo escribir el archivo en el disco.',
                UPLOAD_ERR_EXTENSION  => 'Una extensión de PHP detuvo la subida.',
            ];
            throw new Exception($errors[$file['error']] ?? 'Error al subir el archivo.');
        }

        // Sanitize original filename
        $originalName = basename($file['name']);
        $safeName = self::sanitizeFilename($originalName);
        if ($safeName === '') {
            $safeName = 'archivo_' . time();
        }

        // If file exists, generate non-colliding name: file (1).ext
        $destPath = $targetDir . '/' . $safeName;
        $info = pathinfo($safeName);
        $filename = $info['filename'];
        $extension = isset($info['extension']) ? ('.' . $info['extension']) : '';

        $counter = 1;
        while (file_exists($destPath)) {
            $safeName = sprintf('%s (%d)%s', $filename, $counter, $extension);
            $destPath = $targetDir . '/' . $safeName;
            $counter++;
        }

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            throw new Exception('No se pudo mover el archivo al directorio de destino. Verifique los permisos.');
        }

        @chmod($destPath, 0664);

        return [
            'success'  => true,
            'filename' => $safeName,
            'size'     => filesize($destPath),
            'size_h'   => self::formatBytes(filesize($destPath)),
        ];
    }

    /**
     * Rename an item (file or folder)
     */
    public static function renameItem(string $source, string $relativePath, string $newName): array
    {
        $newName = trim($newName);
        if ($newName === '') {
            throw new Exception('El nuevo nombre no puede estar vacío.');
        }

        if (preg_match('#[\\\\/:*?"<>|]#', $newName)) {
            throw new Exception('El nuevo nombre contiene caracteres no permitidos.');
        }

        $currentPath = self::resolvePath($source, $relativePath);
        if (!file_exists($currentPath)) {
            throw new Exception('El elemento a renombrar no existe.');
        }

        $parentDir = dirname($currentPath);
        $targetPath = $parentDir . '/' . $newName;

        if (file_exists($targetPath)) {
            throw new Exception('Ya existe un elemento con el nuevo nombre en este directorio.');
        }

        if (!@rename($currentPath, $targetPath)) {
            throw new Exception('No se pudo renombrar el elemento. Verifique los permisos.');
        }

        return [
            'success'  => true,
            'message'  => 'Elemento renombrado exitosamente',
            'new_name' => $newName
        ];
    }

    /**
     * Delete an item (file or directory recursively)
     */
    public static function deleteItem(string $source, string $relativePath): array
    {
        $fullPath = self::resolvePath($source, $relativePath);

        // Security check: cannot delete the root of storage or USB
        $basePath = self::getBasePath($source);
        if (realpath($fullPath) === realpath($basePath)) {
            throw new Exception('No se puede eliminar la raíz del almacenamiento.');
        }

        if (!file_exists($fullPath)) {
            throw new Exception('El elemento que intentas eliminar no existe.');
        }

        if (is_dir($fullPath)) {
            self::deleteDirectoryRecursive($fullPath);
        } else {
            if (!@unlink($fullPath)) {
                throw new Exception('No se pudo eliminar el archivo. Verifique los permisos.');
            }
        }

        return [
            'success' => true,
            'message' => 'Elemento eliminado correctamente'
        ];
    }

    /**
     * Stream a file download
     */
    public static function downloadFile(string $source, string $relativePath): void
    {
        $fullPath = self::resolvePath($source, $relativePath);

        if (!is_file($fullPath)) {
            http_response_code(404);
            die('Archivo no encontrado');
        }

        $filename = basename($fullPath);
        $size = filesize($fullPath);
        $mime = self::getMimeType($fullPath);

        // Clean output buffers
        while (ob_get_level()) {
            ob_end_clean();
        }

        header('Content-Description: File Transfer');
        header('Content-Type: ' . $mime);
        header('Content-Disposition: attachment; filename="' . rawurlencode($filename) . '"');
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . $size);

        $fp = fopen($fullPath, 'rb');
        if ($fp !== false) {
            fpassthru($fp);
            fclose($fp);
        }
        exit;
    }

    /**
     * Compress a folder into a ZIP file and stream download
     */
    public static function zipAndDownloadFolder(string $source, string $relativePath): void
    {
        $fullPath = self::resolvePath($source, $relativePath);

        if (!is_dir($fullPath)) {
            http_response_code(404);
            die('Carpeta no encontrada');
        }

        $folderName = ($relativePath === '' ? 'archivos_' . $source : basename($fullPath));
        $zipTmpFile = tempnam(sys_get_temp_dir(), 'zip_');

        $zip = new ZipArchive();
        if ($zip->open($zipTmpFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            die('Error al crear el archivo comprimido.');
        }

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($fullPath, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::LEAVES_ONLY
        );

        $baseLen = strlen($fullPath);
        foreach ($files as $name => $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $subPath = substr($filePath, $baseLen + 1);
                $zip->addFile($filePath, $subPath);
            }
        }

        $zip->close();

        while (ob_get_level()) {
            ob_end_clean();
        }

        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . rawurlencode($folderName) . '.zip"');
        header('Content-Length: ' . filesize($zipTmpFile));
        header('Pragma: no-cache');
        header('Expires: 0');

        readfile($zipTmpFile);
        @unlink($zipTmpFile);
        exit;
    }

    /**
     * Get disk usage statistics for source
     */
    public static function getDiskStats(string $source): array
    {
        $base = self::getBasePath($source);
        $total = @disk_total_space($base);
        $free  = @disk_free_space($base);
        $used  = ($total !== false && $free !== false) ? ($total - $free) : 0;
        $pct   = ($total > 0) ? round(($used / $total) * 100, 1) : 0;

        return [
            'source'       => $source,
            'total_bytes'  => $total ?: 0,
            'free_bytes'   => $free ?: 0,
            'used_bytes'   => $used,
            'used_percent' => $pct,
            'total_h'      => self::formatBytes($total ?: 0),
            'free_h'       => self::formatBytes($free ?: 0),
            'used_h'       => self::formatBytes($used),
        ];
    }

    /**
     * Read content for text/code preview
     */
    public static function readFilePreview(string $source, string $relativePath, int $maxBytes = 524288): array
    {
        $fullPath = self::resolvePath($source, $relativePath);
        if (!is_file($fullPath)) {
            throw new Exception('El archivo no existe.');
        }

        $size = filesize($fullPath);
        $fp = fopen($fullPath, 'rb');
        $content = fread($fp, $maxBytes);
        fclose($fp);

        return [
            'filename'  => basename($fullPath),
            'size'      => $size,
            'truncated' => $size > $maxBytes,
            'content'   => $content,
            'ext'       => strtolower(pathinfo($fullPath, PATHINFO_EXTENSION))
        ];
    }

    private static function deleteDirectoryRecursive(string $dir): bool
    {
        if (!is_dir($dir)) {
            return false;
        }

        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                self::deleteDirectoryRecursive($path);
            } else {
                @unlink($path);
            }
        }
        return @rmdir($dir);
    }

    public static function sanitizeFilename(string $filename): string
    {
        $filename = preg_replace('/[\\\\\/:\*\?"<>\|\x00-\x1F\x7F]/', '', $filename);
        $filename = trim($filename, '. ');
        return $filename;
    }

    public static function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    public static function getMimeType(string $file): string
    {
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $file);
            finfo_close($finfo);
            if ($mime) {
                return $mime;
            }
        }
        return 'application/octet-stream';
    }

    public static function isPreviewable(string $ext): bool
    {
        $previewable = [
            // Images
            'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico',
            // PDF
            'pdf',
            // Audio
            'mp3', 'ogg', 'wav', 'aac', 'm4a',
            // Video
            'mp4', 'webm', 'ogg',
            // Text / Code
            'txt', 'md', 'json', 'js', 'css', 'html', 'htm', 'php', 'sql', 'xml', 'csv', 'py', 'sh', 'log', 'ini', 'conf', 'yaml', 'yml'
        ];
        return in_array(strtolower($ext), $previewable);
    }

    public static function getPreviewType(string $ext): string
    {
        $ext = strtolower($ext);
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'])) {
            return 'image';
        }
        if ($ext === 'pdf') {
            return 'pdf';
        }
        if (in_array($ext, ['mp3', 'ogg', 'wav', 'aac', 'm4a'])) {
            return 'audio';
        }
        if (in_array($ext, ['mp4', 'webm'])) {
            return 'video';
        }
        if (in_array($ext, ['txt', 'md', 'json', 'js', 'css', 'html', 'htm', 'php', 'sql', 'xml', 'csv', 'py', 'sh', 'log', 'ini', 'conf', 'yaml', 'yml'])) {
            return 'text';
        }
        return 'none';
    }

    public static function getIconClass(bool $isDir, string $ext): string
    {
        if ($isDir) {
            return 'fas fa-folder text-warning';
        }

        $map = [
            // Images
            'jpg'  => 'fas fa-file-image text-primary',
            'jpeg' => 'fas fa-file-image text-primary',
            'png'  => 'fas fa-file-image text-primary',
            'gif'  => 'fas fa-file-image text-primary',
            'svg'  => 'fas fa-file-image text-primary',
            'webp' => 'fas fa-file-image text-primary',
            // PDF
            'pdf'  => 'fas fa-file-pdf text-danger',
            // Word
            'doc'  => 'fas fa-file-word text-primary',
            'docx' => 'fas fa-file-word text-primary',
            // Excel
            'xls'  => 'fas fa-file-excel text-success',
            'xlsx' => 'fas fa-file-excel text-success',
            'csv'  => 'fas fa-file-excel text-success',
            // PowerPoint
            'ppt'  => 'fas fa-file-powerpoint text-warning',
            'pptx' => 'fas fa-file-powerpoint text-warning',
            // Archives
            'zip'  => 'fas fa-file-archive text-secondary',
            'rar'  => 'fas fa-file-archive text-secondary',
            '7z'   => 'fas fa-file-archive text-secondary',
            'tar'  => 'fas fa-file-archive text-secondary',
            'gz'   => 'fas fa-file-archive text-secondary',
            // Audio
            'mp3'  => 'fas fa-file-audio text-info',
            'wav'  => 'fas fa-file-audio text-info',
            'ogg'  => 'fas fa-file-audio text-info',
            // Video
            'mp4'  => 'fas fa-file-video text-danger',
            'avi'  => 'fas fa-file-video text-danger',
            'mkv'  => 'fas fa-file-video text-danger',
            'webm' => 'fas fa-file-video text-danger',
            // Code
            'php'  => 'fas fa-file-code text-purple',
            'js'   => 'fas fa-file-code text-warning',
            'css'  => 'fas fa-file-code text-info',
            'html' => 'fas fa-file-code text-danger',
            'sql'  => 'fas fa-database text-info',
            'json' => 'fas fa-file-code text-secondary',
            'py'   => 'fas fa-file-code text-success',
            'sh'   => 'fas fa-terminal text-dark',
            'txt'  => 'fas fa-file-alt text-muted',
            'md'   => 'fas fa-file-alt text-muted',
        ];

        return $map[strtolower($ext)] ?? 'fas fa-file text-muted';
    }
}
