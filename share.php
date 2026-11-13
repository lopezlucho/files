<?php
/**
 * Public Share Landing & Download Page
 * Compatible with PHP 7.4+
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/src/ShareManager.php';
require_once __DIR__ . '/src/FileManager.php';

$token = $_GET['t'] ?? '';
$action = $_GET['action'] ?? '';
$subpath = $_GET['p'] ?? '';

if (empty($token)) {
    die('Enlace no válido');
}

$share = ShareManager::getShare($token);

if (!$share) {
    http_response_code(404);
    die('El enlace solicitado no existe o ha sido revocado.');
}

if (!empty($share['expired'])) {
    http_response_code(410);
    die('Este enlace ha expirado.');
}

// Session check for password verification
$sessionKey = 'share_unlocked_' . $token;
$isUnlocked = empty($share['has_password']) || !empty($_SESSION[$sessionKey]);

// Handle password submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if (ShareManager::verifyPassword($share, $_POST['password'])) {
        $_SESSION[$sessionKey] = true;
        header('Location: ' . BASE_URL . '/share.php?t=' . $token . ($subpath ? '&p=' . urlencode($subpath) : ''));
        exit;
    } else {
        $error = 'Contraseña incorrecta';
    }
}

// If password required and not unlocked, show password form
if (!$isUnlocked) {
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Archivo Protegido - <?= htmlspecialchars(APP_NAME) ?></title>
        <link rel="stylesheet" href="<?= BASE_URL ?>/public/assets/plugins/fontawesome-free/css/all.min.css">
        <link rel="stylesheet" href="<?= BASE_URL ?>/public/assets/dist/css/adminlte.min.css">
        <link rel="stylesheet" href="<?= BASE_URL ?>/public/css/custom.css">
    </head>
    <body class="hold-transition login-page bg-light">
    <div class="login-box">
        <div class="card card-outline card-primary shadow">
            <div class="card-header text-center py-3">
                <i class="fas fa-lock fa-2x text-primary mb-2"></i>
                <h4 class="mb-0"><b>Enlace Protegido</b></h4>
            </div>
            <div class="card-body">
                <p class="login-box-msg">Ingresa la contraseña para acceder a <b><?= htmlspecialchars($share['filename']) ?></b></p>
                <?php if (!empty($error)): ?>
                    <div class="alert alert-danger py-2"><?= htmlspecialchars($error) ?></div>
                <?php endif; ?>
                <form method="post">
                    <div class="input-group mb-3">
                        <input type="password" name="password" class="form-control" placeholder="Contraseña" required autofocus>
                        <div class="input-group-append">
                            <div class="input-group-text"><span class="fas fa-key"></span></div>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Desbloquear</button>
                </form>
            </div>
        </div>
    </div>
    </body>
    </html>
    <?php
    exit;
}

// Download action
if ($action === 'download') {
    ShareManager::incrementDownloads((int)$share['id']);
    if ($share['is_folder']) {
        if (!empty($subpath)) {
            $itemRel = trim($share['path'] . '/' . $subpath, '/');
            FileManager::downloadFile($share['source'], $itemRel);
        } else {
            FileManager::zipAndDownloadFolder($share['source'], $share['path']);
        }
    } else {
        FileManager::downloadFile($share['source'], $share['path']);
    }
    exit;
}

// Preview action
if ($action === 'preview') {
    $targetPath = $share['path'];
    if ($share['is_folder'] && !empty($subpath)) {
        $targetPath = trim($share['path'] . '/' . $subpath, '/');
    }
    $fullPath = FileManager::resolvePath($share['source'], $targetPath);
    if (!is_file($fullPath)) {
        http_response_code(404);
        die('Archivo no encontrado');
    }
    $mime = FileManager::getMimeType($fullPath);
    header('Content-Type: ' . $mime);
    header('Content-Disposition: inline; filename="' . rawurlencode(basename($fullPath)) . '"');
    readfile($fullPath);
    exit;
}

// Folder or file landing view
$folderItems = null;
if ($share['is_folder']) {
    $currentBrowsePath = trim($share['path'] . ($subpath ? '/' . $subpath : ''), '/');
    try {
        $folderItems = FileManager::listDirectory($share['source'], $currentBrowsePath);
    } catch (Exception $e) {
        $folderError = $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= htmlspecialchars($share['filename']) ?> - <?= htmlspecialchars(APP_NAME) ?></title>
    <link rel="stylesheet" href="<?= BASE_URL ?>/public/assets/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/public/assets/dist/css/adminlte.min.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/public/assets/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/public/css/custom.css">
</head>
<body class="hold-transition layout-top-nav bg-light">
<div class="wrapper">
    <nav class="main-header navbar navbar-expand-md navbar-light navbar-white border-bottom shadow-sm">
        <div class="container">
            <span class="navbar-brand">
                <i class="fas fa-cloud text-primary mr-1"></i>
                <span class="brand-text font-weight-bold"><?= htmlspecialchars(APP_NAME) ?></span>
            </span>
            <span class="navbar-text ml-auto text-muted">
                <i class="fas fa-shield-alt text-success mr-1"></i> Compartición Segura
            </span>
        </div>
    </nav>

    <div class="content-wrapper py-4">
        <div class="container">
            <div class="card card-outline card-primary shadow-sm">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <h4 class="card-title mb-0">
                            <i class="<?= $share['is_folder'] ? 'fas fa-folder text-warning' : 'fas fa-file text-primary' ?> mr-2"></i>
                            <b><?= htmlspecialchars($share['filename']) ?></b>
                        </h4>
                        <small class="d-block text-muted">
                            Compartido el <?= date('d/m/Y H:i', strtotime($share['created_at'])) ?>
                            <?php if (!empty($share['expires_at'])): ?>
                                · Expira: <?= date('d/m/Y H:i', strtotime($share['expires_at'])) ?>
                            <?php endif; ?>
                            · Descargas: <?= (int)$share['downloads'] ?>
                        </small>
                    </div>
                    <div>
                        <a href="<?= BASE_URL ?>/share.php?t=<?= urlencode($token) ?>&action=download" class="btn btn-success font-weight-bold">
                            <i class="fas fa-download mr-1"></i> <?= $share['is_folder'] ? 'Descargar Carpeta (.ZIP)' : 'Descargar Archivo' ?>
                        </a>
                    </div>
                </div>

                <div class="card-body">
                    <?php if ($share['is_folder']): ?>
                        <h5>Contenido de la carpeta:</h5>
                        <?php if (!empty($folderError)): ?>
                            <div class="alert alert-warning"><?= htmlspecialchars($folderError) ?></div>
                        <?php else: ?>
                            <div class="table-responsive">
                                <table class="table table-hover table-striped">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Tamaño</th>
                                            <th>Modificado</th>
                                            <th class="text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php if (!empty($subpath)): ?>
                                            <tr>
                                                <td colspan="4">
                                                    <a href="<?= BASE_URL ?>/share.php?t=<?= urlencode($token) ?>&p=<?= urlencode(dirname($subpath) === '.' ? '' : dirname($subpath)) ?>" class="text-primary font-weight-bold">
                                                        <i class="fas fa-level-up-alt mr-1"></i> Subir un nivel
                                                    </a>
                                                </td>
                                            </tr>
                                        <?php endif; ?>
                                        <?php foreach ($folderItems['items'] as $item): ?>
                                            <tr>
                                                <td>
                                                    <i class="<?= $item['icon'] ?> mr-2"></i>
                                                    <?php if ($item['is_dir']): ?>
                                                        <a href="<?= BASE_URL ?>/share.php?t=<?= urlencode($token) ?>&p=<?= urlencode(($subpath ? $subpath . '/' : '') . $item['name']) ?>" class="font-weight-bold">
                                                            <?= htmlspecialchars($item['name']) ?>/
                                                        </a>
                                                    <?php else: ?>
                                                        <?= htmlspecialchars($item['name']) ?>
                                                    <?php endif; ?>
                                                </td>
                                                <td><?= $item['size_h'] ?></td>
                                                <td><?= $item['modified_h'] ?></td>
                                                <td class="text-right">
                                                    <?php if (!$item['is_dir']): ?>
                                                        <?php if ($item['is_previewable']): ?>
                                                            <a href="<?= BASE_URL ?>/share.php?t=<?= urlencode($token) ?>&p=<?= urlencode(($subpath ? $subpath . '/' : '') . $item['name']) ?>&action=preview" target="_blank" class="btn btn-sm btn-outline-info mr-1">
                                                                <i class="fas fa-eye"></i>
                                                            </a>
                                                        <?php endif; ?>
                                                        <a href="<?= BASE_URL ?>/share.php?t=<?= urlencode($token) ?>&p=<?= urlencode(($subpath ? $subpath . '/' : '') . $item['name']) ?>&action=download" class="btn btn-sm btn-outline-success">
                                                            <i class="fas fa-download"></i>
                                                        </a>
                                                    <?php endif; ?>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        <?php endif; ?>
                    <?php else: ?>
                        <!-- Single file preview if applicable -->
                        <?php
                        $ext = strtolower(pathinfo($share['filename'], PATHINFO_EXTENSION));
                        $previewType = FileManager::getPreviewType($ext);
                        ?>
                        <div class="text-center py-4">
                            <?php if ($previewType === 'image'): ?>
                                <img src="<?= BASE_URL ?>/share.php?t=<?= urlencode($token) ?>&action=preview" class="img-fluid rounded shadow-sm" style="max-height: 480px;">
                            <?php elseif ($previewType === 'pdf'): ?>
                                <iframe src="<?= BASE_URL ?>/share.php?t=<?= urlencode($token) ?>&action=preview" style="width: 100%; height: 600px; border: none;" class="rounded shadow-sm"></iframe>
                            <?php elseif ($previewType === 'video'): ?>
                                <video controls class="w-100 rounded shadow-sm" style="max-height: 480px;">
                                    <source src="<?= BASE_URL ?>/share.php?t=<?= urlencode($token) ?>&action=preview">
                                    Tu navegador no soporta reproducción de video.
                                </video>
                            <?php elseif ($previewType === 'audio'): ?>
                                <audio controls class="w-75">
                                    <source src="<?= BASE_URL ?>/share.php?t=<?= urlencode($token) ?>&action=preview">
                                    Tu navegador no soporta reproducción de audio.
                                </audio>
                            <?php else: ?>
                                <i class="<?= FileManager::getIconClass(false, $ext) ?> fa-5x mb-3"></i>
                                <h4><?= htmlspecialchars($share['filename']) ?></h4>
                                <p class="text-muted">Haz clic en el botón de descarga superior para obtener este archivo.</p>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <footer class="main-footer text-center text-muted small py-3">
        <b><?= htmlspecialchars(APP_NAME) ?></b> &copy; <?= date('Y') ?>. Gestor de Archivos en la Nube.
    </footer>
</div>
</body>
</html>
