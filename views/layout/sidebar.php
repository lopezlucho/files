<?php
$currentView = $_GET['view'] ?? 'files';
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
                <li class="nav-header text-uppercase font-weight-bold text-muted small">Explorador</li>

                <!-- Dual Commander Files -->
                <li class="nav-item">
                    <a href="<?= BASE_URL ?>/" class="nav-link <?= ($currentView === 'files') ? 'active' : '' ?>">
                        <i class="nav-icon fas fa-columns text-primary"></i>
                        <p>
                            Modo Commander
                            <span class="badge badge-primary right">Dual</span>
                        </p>
                    </a>
                </li>

                <li class="nav-header text-uppercase font-weight-bold text-muted small mt-2">Dispositivos y Red</li>

                <!-- USB Management -->
                <li class="nav-item">
                    <a href="<?= BASE_URL ?>/?view=usb" class="nav-link <?= ($currentView === 'usb') ? 'active' : '' ?>">
                        <i class="nav-icon fas fa-microchip text-warning"></i>
                        <p>
                            Unidades USB
                            <?php if ($isUsbMounted): ?>
                                <span class="badge badge-pill badge-success right">Online</span>
                            <?php else: ?>
                                <span class="badge badge-pill badge-secondary right">Offline</span>
                            <?php endif; ?>
                        </p>
                    </a>
                </li>

                <!-- Shared Links -->
                <li class="nav-item">
                    <a href="<?= BASE_URL ?>/?view=shares" class="nav-link <?= ($currentView === 'shares') ? 'active' : '' ?>">
                        <i class="nav-icon fas fa-share-alt text-info"></i>
                        <p>Enlaces Compartidos</p>
                    </a>
                </li>
            </ul>
        </nav>
        <!-- /.sidebar-menu -->
    </div>
    <!-- /.sidebar -->
</aside>
