<?php
$currentUser = Auth::user();
$isUsbMounted = UsbManager::isMounted();
$currentSource = $_GET['source'] ?? 'local';
if ($currentSource !== 'usb') {
    $currentSource = 'local';
}
?>
<!-- Navbar -->
<nav class="main-header navbar navbar-expand navbar-white navbar-light border-bottom">
    <!-- Left navbar links -->
    <ul class="navbar-nav">
        <li class="nav-item">
            <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
        </li>
        <!-- Storage Source Selector -->
        <li class="nav-item d-none d-sm-inline-block">
            <div class="btn-group btn-group-sm ml-2">
                <a href="<?= BASE_URL ?>/?source=local" class="btn <?= $currentSource === 'local' ? 'btn-primary font-weight-bold' : 'btn-outline-secondary' ?>">
                    <i class="fas fa-hdd mr-1"></i> Almacenamiento Local
                </a>
                <a href="<?= BASE_URL ?>/?source=usb" class="btn <?= $currentSource === 'usb' ? 'btn-primary font-weight-bold' : 'btn-outline-secondary' ?>">
                    <i class="fab fa-usb mr-1"></i> Unidad USB
                </a>
            </div>
        </li>
    </ul>

    <!-- Right navbar links -->
    <ul class="navbar-nav ml-auto align-items-center">
        <!-- USB Quick Status -->
        <li class="nav-item mr-3">
            <div class="d-flex align-items-center" id="navbarUsbIndicator">
                <?php if ($isUsbMounted): ?>
                    <span class="badge badge-success px-2 py-1 mr-2 shadow-sm" title="Unidad USB montada en /media/usb">
                        <i class="fab fa-usb mr-1"></i> USB Montado
                    </span>
                    <button class="btn btn-xs btn-outline-danger" id="btnQuickUnmount" title="Desmontar USB de forma segura">
                        <i class="fas fa-eject mr-1"></i> Expulsar
                    </button>
                <?php else: ?>
                    <span class="badge badge-secondary px-2 py-1 mr-2" title="No hay unidad USB montada">
                        <i class="fab fa-usb mr-1"></i> USB Desconectado
                    </span>
                    <a href="<?= BASE_URL ?>/?view=usb" class="btn btn-xs btn-outline-primary" title="Detectar y montar unidad USB">
                        <i class="fas fa-plug mr-1"></i> Montar
                    </a>
                <?php endif; ?>
            </div>
        </li>

        <!-- User Dropdown Menu -->
        <li class="nav-item dropdown">
            <a class="nav-link" data-toggle="dropdown" href="#" role="button">
                <i class="fas fa-user-circle fa-lg text-primary mr-1"></i>
                <span class="d-none d-md-inline font-weight-bold"><?= htmlspecialchars($currentUser['name'] ?? 'Administrador') ?></span>
                <i class="fas fa-angle-down ml-1"></i>
            </a>
            <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right shadow">
                <div class="dropdown-header text-center bg-light">
                    <strong><?= htmlspecialchars($currentUser['username'] ?? 'admin') ?></strong>
                    <div class="small text-muted">Rol: Administrador</div>
                </div>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item" data-toggle="modal" data-target="#modalChangePassword">
                    <i class="fas fa-key text-warning mr-2"></i> Cambiar Contraseña
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item text-danger" id="btnLogout">
                    <i class="fas fa-sign-out-alt mr-2"></i> Cerrar Sesión
                </a>
            </div>
        </li>
    </ul>
</nav>
<!-- /.navbar -->
