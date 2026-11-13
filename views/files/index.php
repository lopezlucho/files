<?php
$source = $_GET['source'] ?? 'local';
if ($source !== 'usb') {
    $source = 'local';
}
$isUsb = ($source === 'usb');
$isUsbMounted = UsbManager::isMounted();
?>

<!-- Content Header (Page header) -->
<div class="content-header pb-2">
    <div class="container-fluid">
        <div class="row align-items-center">
            <div class="col-sm-6">
                <h1 class="m-0 font-weight-bold">
                    <i class="<?= $isUsb ? 'fab fa-usb text-success' : 'fas fa-hdd text-info' ?> mr-2"></i>
                    <?= $isUsb ? 'Almacenamiento USB Externo' : 'Almacenamiento en la Nube (Local)' ?>
                </h1>
            </div>
            <div class="col-sm-6 text-sm-right mt-2 mt-sm-0">
                <button type="button" class="btn btn-primary btn-sm shadow-sm" id="btnOpenUpload" <?= ($isUsb && !$isUsbMounted) ? 'disabled' : '' ?>>
                    <i class="fas fa-cloud-upload-alt mr-1"></i> Subir Archivos
                </button>
                <button type="button" class="btn btn-outline-primary btn-sm shadow-sm ml-1" id="btnNewFolder" <?= ($isUsb && !$isUsbMounted) ? 'disabled' : '' ?>>
                    <i class="fas fa-folder-plus mr-1"></i> Nueva Carpeta
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm shadow-sm ml-1" id="btnDownloadZip" <?= ($isUsb && !$isUsbMounted) ? 'disabled' : '' ?> title="Descargar carpeta actual como archivo .ZIP">
                    <i class="fas fa-file-archive mr-1"></i> Descargar Zip
                </button>
                <button type="button" class="btn btn-outline-info btn-sm shadow-sm ml-1" id="btnRefreshFiles" title="Recargar lista">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Main content -->
<div class="content">
    <div class="container-fluid">

        <?php if ($isUsb && !$isUsbMounted): ?>
            <!-- USB Unmounted Warning -->
            <div class="alert alert-warning shadow-sm d-flex align-items-center justify-content-between">
                <div>
                    <h5 class="mb-1"><i class="fas fa-exclamation-triangle mr-2"></i> Unidad USB no montada</h5>
                    <p class="mb-0">Para explorar o gestionar archivos en el almacenamiento externo, debes montar la unidad USB primero.</p>
                </div>
                <div>
                    <a href="<?= BASE_URL ?>/?view=usb" class="btn btn-warning font-weight-bold shadow-sm">
                        <i class="fas fa-microchip mr-1"></i> Ir a Gestión de Dispositivos
                    </a>
                </div>
            </div>
        <?php else: ?>

            <!-- Storage & Breadcrumbs Bar -->
            <div class="card card-outline card-primary shadow-sm mb-3">
                <div class="card-body py-2 px-3">
                    <div class="row align-items-center">
                        <!-- Breadcrumbs -->
                        <div class="col-md-7 mb-2 mb-md-0">
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb mb-0" id="fileBreadcrumbs">
                                    <li class="breadcrumb-item"><a href="javascript:void(0)" onclick="app.loadPath('')"><i class="fas fa-home"></i> Inicio</a></li>
                                </ol>
                            </nav>
                        </div>
                        <!-- Storage usage meter -->
                        <div class="col-md-5">
                            <div class="d-flex justify-content-between align-items-center small text-muted mb-1">
                                <span><i class="fas fa-database mr-1"></i> Espacio: <strong id="lblUsedSpace">0 B</strong> de <strong id="lblTotalSpace">0 B</strong></span>
                                <span class="font-weight-bold" id="lblUsedPct">0%</span>
                            </div>
                            <div class="progress storage-meter">
                                <div class="progress-bar bg-primary" id="barStorageUsage" role="progressbar" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Files Explorer Card -->
            <div class="card shadow-sm">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table id="tblFiles" class="table table-hover table-striped table-valign-middle mb-0" style="width:100%">
                            <thead class="thead-light">
                                <tr>
                                    <th style="width: 45px;" class="text-center"><i class="fas fa-folder-open text-muted"></i></th>
                                    <th>Nombre</th>
                                    <th style="width: 120px;">Tamaño</th>
                                    <th style="width: 160px;">Última Modificación</th>
                                    <th style="width: 160px;" class="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Loaded dynamically via AJAX -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        <?php endif; ?>

    </div>
</div>

<script>
    window.APP_CONFIG = {
        source: '<?= $source ?>',
        currentPath: '',
        isMounted: <?= ($isUsb && !$isUsbMounted) ? 'false' : 'true' ?>
    };
</script>
