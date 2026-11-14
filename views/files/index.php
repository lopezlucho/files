<?php
$isUsbMounted = UsbManager::isMounted();
?>

<!-- Content Header -->
<div class="content-header pb-1 pt-2">
    <div class="container-fluid">
        <div class="row align-items-center">
            <div class="col-sm-6">
                <h1 class="m-0 font-weight-bold" style="font-size: 1.35rem;">
                    <i class="fas fa-columns text-primary mr-2"></i> Gestor de Archivos - Modo Commander (Dual Panel)
                </h1>
            </div>
            <div class="col-sm-6 text-sm-right mt-2 mt-sm-0">
                <button type="button" class="btn btn-outline-info btn-xs mr-1" onclick="app.showHelp()">
                    <i class="fas fa-question-circle mr-1"></i> Ayuda de Teclado [F1]
                </button>
                <button type="button" class="btn btn-outline-secondary btn-xs mr-1" onclick="app.switchActivePanel()">
                    <i class="fas fa-exchange-alt mr-1"></i> Alternar Panel [Tab]
                </button>
                <button type="button" class="btn btn-outline-primary btn-xs" onclick="app.refreshAll()">
                    <i class="fas fa-sync-alt mr-1"></i> Recargar Todo
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Main content -->
<div class="content pb-4">
    <div class="container-fluid">

        <!-- Two Panels Row -->
        <div class="row">

            <!-- LEFT PANEL -->
            <div class="col-md-6 mb-3 mb-md-0">
                <div class="commander-panel panel-active" id="panel-left" data-panel="left">
                    <!-- Panel Header -->
                    <div class="panel-header">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <div class="d-flex align-items-center">
                                <span class="badge badge-primary mr-2 font-weight-bold px-2 py-1 panel-badge-indicator">
                                    <i class="fas fa-arrow-right mr-1"></i> PANEL IZQUIERDO [ACTIVO]
                                </span>
                                <!-- Storage Source Selector -->
                                <div class="btn-group btn-group-xs">
                                    <button type="button" class="btn btn-outline-secondary btn-xs btn-src-local active" onclick="app.setPanelSource('left', 'local')">
                                        <i class="fas fa-hdd mr-1"></i> Local
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary btn-xs btn-src-usb <?= !$isUsbMounted ? 'disabled' : '' ?>" onclick="app.setPanelSource('left', 'usb')" <?= !$isUsbMounted ? 'title="USB no montada"' : '' ?>>
                                        <i class="fab fa-usb mr-1"></i> USB
                                    </button>
                                </div>
                            </div>
                            <div>
                                <small class="text-muted font-weight-bold disk-stats-text" id="stats-left">Espacio: -</small>
                            </div>
                        </div>

                        <!-- Breadcrumbs & Quick Filter -->
                        <div class="d-flex align-items-center mt-2">
                            <div class="flex-grow-1 mr-2">
                                <ol class="breadcrumb bg-light p-1 border rounded small mb-0" id="breadcrumbs-left" style="min-height: 28px;">
                                    <li class="breadcrumb-item"><a href="javascript:void(0)" onclick="app.loadPanelPath('left', '')"><i class="fas fa-home"></i> /</a></li>
                                </ol>
                            </div>
                            <div style="width: 140px;">
                                <input type="text" class="form-control form-control-sm" id="filter-left" placeholder="Filtrar..." autocomplete="off">
                            </div>
                        </div>
                    </div>

                    <!-- Panel Table Container -->
                    <div class="panel-table-container">
                        <table class="table table-sm table-hover table-valign-middle commander-table" id="tbl-left">
                            <thead class="thead-light sticky-top">
                                <tr>
                                    <th style="width: 32px;" class="text-center">
                                        <input type="checkbox" class="chk-select-all" data-panel="left" title="Seleccionar/Deseleccionar todos">
                                    </th>
                                    <th style="width: 28px;" class="text-center"><i class="fas fa-folder text-muted"></i></th>
                                    <th>Nombre</th>
                                    <th style="width: 85px;" class="text-right">Tamaño</th>
                                    <th style="width: 120px;" class="text-right">Modificado</th>
                                </tr>
                            </thead>
                            <tbody id="tbody-left">
                                <tr><td colspan="5" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando...</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Panel Footer -->
                    <div class="panel-footer d-flex justify-content-between align-items-center">
                        <span class="text-muted small" id="summary-left">0 elementos | 0 seleccionados</span>
                        <div>
                            <button type="button" class="btn btn-xs btn-outline-primary mr-1" onclick="app.openUploadModal('left')">
                                <i class="fas fa-upload mr-1"></i> Subir
                            </button>
                            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="app.promptNewFolder('left')">
                                <i class="fas fa-folder-plus mr-1"></i> Carpeta
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT PANEL -->
            <div class="col-md-6">
                <div class="commander-panel" id="panel-right" data-panel="right">
                    <!-- Panel Header -->
                    <div class="panel-header">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <div class="d-flex align-items-center">
                                <span class="badge badge-secondary mr-2 font-weight-bold px-2 py-1 panel-badge-indicator">
                                    PANEL DERECHO
                                </span>
                                <!-- Storage Source Selector -->
                                <div class="btn-group btn-group-xs">
                                    <button type="button" class="btn btn-outline-secondary btn-xs btn-src-local active" onclick="app.setPanelSource('right', 'local')">
                                        <i class="fas fa-hdd mr-1"></i> Local
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary btn-xs btn-src-usb <?= !$isUsbMounted ? 'disabled' : '' ?>" onclick="app.setPanelSource('right', 'usb')" <?= !$isUsbMounted ? 'title="USB no montada"' : '' ?>>
                                        <i class="fab fa-usb mr-1"></i> USB
                                    </button>
                                </div>
                            </div>
                            <div>
                                <small class="text-muted font-weight-bold disk-stats-text" id="stats-right">Espacio: -</small>
                            </div>
                        </div>

                        <!-- Breadcrumbs & Quick Filter -->
                        <div class="d-flex align-items-center mt-2">
                            <div class="flex-grow-1 mr-2">
                                <ol class="breadcrumb bg-light p-1 border rounded small mb-0" id="breadcrumbs-right" style="min-height: 28px;">
                                    <li class="breadcrumb-item"><a href="javascript:void(0)" onclick="app.loadPanelPath('right', '')"><i class="fas fa-home"></i> /</a></li>
                                </ol>
                            </div>
                            <div style="width: 140px;">
                                <input type="text" class="form-control form-control-sm" id="filter-right" placeholder="Filtrar..." autocomplete="off">
                            </div>
                        </div>
                    </div>

                    <!-- Panel Table Container -->
                    <div class="panel-table-container">
                        <table class="table table-sm table-hover table-valign-middle commander-table" id="tbl-right">
                            <thead class="thead-light sticky-top">
                                <tr>
                                    <th style="width: 32px;" class="text-center">
                                        <input type="checkbox" class="chk-select-all" data-panel="right" title="Seleccionar/Deseleccionar todos">
                                    </th>
                                    <th style="width: 28px;" class="text-center"><i class="fas fa-folder text-muted"></i></th>
                                    <th>Nombre</th>
                                    <th style="width: 85px;" class="text-right">Tamaño</th>
                                    <th style="width: 120px;" class="text-right">Modificado</th>
                                </tr>
                            </thead>
                            <tbody id="tbody-right">
                                <tr><td colspan="5" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando...</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Panel Footer -->
                    <div class="panel-footer d-flex justify-content-between align-items-center">
                        <span class="text-muted small" id="summary-right">0 elementos | 0 seleccionados</span>
                        <div>
                            <button type="button" class="btn btn-xs btn-outline-primary mr-1" onclick="app.openUploadModal('right')">
                                <i class="fas fa-upload mr-1"></i> Subir
                            </button>
                            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="app.promptNewFolder('right')">
                                <i class="fas fa-folder-plus mr-1"></i> Carpeta
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- Classic Midnight Commander Bottom Function Keys Bar -->
        <div class="commander-fn-bar shadow">
            <a href="javascript:void(0)" class="commander-fn-btn" onclick="app.showHelp()">
                <span class="fn-badge">F1</span> Ayuda
            </a>
            <a href="javascript:void(0)" class="commander-fn-btn" onclick="app.switchActivePanel()">
                <span class="fn-badge">Tab</span> Alternar
            </a>
            <a href="javascript:void(0)" class="commander-fn-btn" onclick="app.actionView()">
                <span class="fn-badge">F3</span> Ver
            </a>
            <a href="javascript:void(0)" class="commander-fn-btn" onclick="app.actionEdit()">
                <span class="fn-badge">F4</span> Editar
            </a>
            <a href="javascript:void(0)" class="commander-fn-btn" onclick="app.actionCopyBatch()">
                <span class="fn-badge">F5</span> Copiar
            </a>
            <a href="javascript:void(0)" class="commander-fn-btn" onclick="app.actionMoveBatch()">
                <span class="fn-badge">F6</span> Mover
            </a>
            <a href="javascript:void(0)" class="commander-fn-btn" onclick="app.actionNewFolder()">
                <span class="fn-badge">F7</span> NvaCarp
            </a>
            <a href="javascript:void(0)" class="commander-fn-btn text-danger" onclick="app.actionDeleteBatch()">
                <span class="fn-badge">F8</span> Borrar
            </a>
            <a href="javascript:void(0)" class="commander-fn-btn" onclick="app.actionToggleSource()">
                <span class="fn-badge">F9</span> Origen
            </a>
        </div>

    </div>
</div>

<script>
    window.APP_CONFIG = {
        isUsbMounted: <?= $isUsbMounted ? 'true' : 'false' ?>
    };
</script>
