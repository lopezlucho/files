<?php
$isUsbMounted = UsbManager::isMounted();
$mountedInfo = $isUsbMounted ? UsbManager::getMountedInfo() : null;
?>

<!-- Content Header (Page header) -->
<div class="content-header pb-2">
    <div class="container-fluid">
        <div class="row align-items-center">
            <div class="col-sm-6">
                <h1 class="m-0 font-weight-bold">
                    <i class="fas fa-microchip text-warning mr-2"></i> Gestión de Dispositivos y Unidades USB
                </h1>
            </div>
            <div class="col-sm-6 text-sm-right mt-2 mt-sm-0">
                <button type="button" class="btn btn-outline-info btn-sm shadow-sm" id="btnRefreshUsb" title="Escanear dispositivos">
                    <i class="fas fa-sync-alt mr-1"></i> Actualizar Dispositivos
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Main content -->
<div class="content">
    <div class="container-fluid">

        <!-- Status Card -->
        <div class="row">
            <div class="col-12">
                <div class="card card-outline <?= $isUsbMounted ? 'card-success' : 'card-secondary' ?> shadow-sm">
                    <div class="card-header">
                        <h3 class="card-title font-weight-bold">
                            <i class="fab fa-usb mr-2"></i> Punto de Montaje: <code>/media/usb</code>
                        </h3>
                        <div class="card-tools">
                            <?php if ($isUsbMounted): ?>
                                <span class="badge badge-success px-3 py-1 font-weight-bold">MONTADO</span>
                            <?php else: ?>
                                <span class="badge badge-secondary px-3 py-1 font-weight-bold">DESMONTADO</span>
                            <?php endif; ?>
                        </div>
                    </div>
                    <div class="card-body">
                        <?php if ($isUsbMounted && $mountedInfo): ?>
                            <div class="row align-items-center">
                                <div class="col-md-3">
                                    <div class="info-box bg-light shadow-none mb-2 mb-md-0">
                                        <span class="info-box-icon bg-success"><i class="fas fa-hdd"></i></span>
                                        <div class="info-box-content">
                                            <span class="info-box-text">Dispositivo</span>
                                            <span class="info-box-number"><?= htmlspecialchars($mountedInfo['device'] ?? 'USB') ?></span>
                                            <small class="text-muted">Formato: <?= htmlspecialchars($mountedInfo['fstype'] ?? '') ?></small>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span class="text-muted">Espacio Usado:</span>
                                        <span class="font-weight-bold"><?= $mountedInfo['used_h'] ?> de <?= $mountedInfo['total_h'] ?> (Libre: <?= $mountedInfo['free_h'] ?>)</span>
                                    </div>
                                    <div class="progress progress-sm">
                                        <div class="progress-bar bg-success" style="width: <?= $mountedInfo['used_percent'] ?>%"></div>
                                    </div>
                                    <small class="text-muted"><?= $mountedInfo['used_percent'] ?>% del espacio ocupado</small>
                                </div>
                                <div class="col-md-3 text-md-right mt-3 mt-md-0">
                                    <a href="<?= BASE_URL ?>/?source=usb" class="btn btn-primary btn-sm mb-1 mr-1">
                                        <i class="fas fa-folder-open mr-1"></i> Explorar Archivos
                                    </a>
                                    <button class="btn btn-danger btn-sm mb-1" id="btnUnmountUsbAction">
                                        <i class="fas fa-eject mr-1"></i> Desmontar
                                    </button>
                                </div>
                            </div>
                        <?php else: ?>
                            <div class="text-center py-3 text-muted">
                                <i class="fas fa-plug fa-3x mb-3 text-secondary"></i>
                                <h5>No hay ningún dispositivo montado actualmente en <code>/media/usb</code></h5>
                                <p class="mb-0">Conecta una unidad USB o selecciona una partición detectada en la tabla inferior y presiona <b>"Montar"</b>.</p>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detected Block Devices List -->
        <div class="row">
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-header border-0 bg-light">
                        <h3 class="card-title font-weight-bold">
                            <i class="fas fa-list mr-1"></i> Unidades y Particiones Detectadas
                        </h3>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover table-valign-middle mb-0" id="tblUsbDevices">
                                <thead class="thead-light">
                                    <tr>
                                        <th>Dispositivo</th>
                                        <th>Etiqueta / Nombre</th>
                                        <th>Modelo</th>
                                        <th>Sistema de Archivos</th>
                                        <th>Tamaño</th>
                                        <th>Punto de Montaje</th>
                                        <th class="text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="7" class="text-center py-4 text-muted">
                                            <i class="fas fa-spinner fa-spin mr-2"></i> Buscando dispositivos conectados...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>
