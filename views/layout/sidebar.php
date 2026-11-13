<?php
$currentView = $_GET['view'] ?? 'files';
$currentSource = $_GET['source'] ?? 'local';
if ($currentSource !== 'usb') {
    $currentSource = 'local';
}
$isUsbMounted = UsbManager::isMounted();
?>
<!-- Main Sidebar Container -->
<aside class="main-sidebar sidebar-dark-primary elevation-4">
    <!-- Brand Logo -->
    <a href="<?= BASE_URL ?>/" class="brand-link">
        <i class="fas fa-cloud brand-image img-circle elevation-3 text-primary d-flex align-items-center justify-content-center" style="opacity: .8; font-size: 1.6rem; margin-left: 0.8rem; margin-top: 0.2rem;"></i>
        <span class="brand-text font-weight-bold ml-2"><?= htmlspecialchars(APP_NAME) ?></span>
    </a>

    <!-- Sidebar -->
    <div class="sidebar">
        <!-- Sidebar Menu -->
        <nav class="mt-3">
            <ul class="nav nav-pills nav-sidebar flex-column nav-child-indent" data-widget="treeview" role="menu" data-accordion="false">
                <li class="nav-header text-uppercase font-weight-bold text-muted small">Almacenamiento</li>

                <!-- Local Storage -->
                <li class="nav-item">
                    <a href="<?= BASE_URL ?>/?source=local" class="nav-link <?= ($currentView === 'files' && $currentSource === 'local') ? 'active' : '' ?>">
                        <i class="nav-icon fas fa-hdd text-info"></i>
                        <p>
                            Archivos Locales
                            <span class="badge badge-info right">Local</span>
                        </p>
                    </a>
                </li>

                <!-- USB Storage -->
                <li class="nav-item">
                    <a href="<?= BASE_URL ?>/?source=usb" class="nav-link <?= ($currentView === 'files' && $currentSource === 'usb') ? 'active' : '' ?>">
                        <i class="nav-icon fab fa-usb <?= $isUsbMounted ? 'text-success' : 'text-muted' ?>"></i>
                        <p>
                            Unidad USB
                            <?php if ($isUsbMounted): ?>
                                <span class="badge badge-success right">Online</span>
                            <?php else: ?>
                                <span class="badge badge-secondary right">Offline</span>
                            <?php endif; ?>
                        </p>
                    </a>
                </li>

                <li class="nav-header text-uppercase font-weight-bold text-muted small mt-2">Administración</li>

                <!-- USB Management -->
                <li class="nav-item">
                    <a href="<?= BASE_URL ?>/?view=usb" class="nav-link <?= ($currentView === 'usb') ? 'active' : '' ?>">
                        <i class="nav-icon fas fa-microchip text-warning"></i>
                        <p>
                            Gestión de Dispositivos
                            <?php if ($isUsbMounted): ?>
                                <span class="badge badge-pill badge-success right">1</span>
                            <?php endif; ?>
                        </p>
                    </a>
                </li>

                <!-- Shared Links -->
                <li class="nav-item">
                    <a href="<?= BASE_URL ?>/?view=shares" class="nav-link <?= ($currentView === 'shares') ? 'active' : '' ?>">
                        <i class="nav-icon fas fa-share-alt text-primary"></i>
                        <p>Enlaces Compartidos</p>
                    </a>
                </li>
            </ul>
        </nav>
        <!-- /.sidebar-menu -->
    </div>
    <!-- /.sidebar -->
</aside>
