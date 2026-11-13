<!-- Content Header (Page header) -->
<div class="content-header pb-2">
    <div class="container-fluid">
        <div class="row align-items-center">
            <div class="col-sm-6">
                <h1 class="m-0 font-weight-bold">
                    <i class="fas fa-share-alt text-primary mr-2"></i> Enlaces Públicos Compartidos
                </h1>
            </div>
            <div class="col-sm-6 text-sm-right mt-2 mt-sm-0">
                <button type="button" class="btn btn-outline-info btn-sm shadow-sm" id="btnRefreshShares" title="Actualizar lista">
                    <i class="fas fa-sync-alt mr-1"></i> Actualizar
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Main content -->
<div class="content">
    <div class="container-fluid">
        <div class="card shadow-sm">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-striped table-hover table-valign-middle mb-0" id="tblShares">
                        <thead class="thead-light">
                            <tr>
                                <th>Nombre</th>
                                <th>Origen</th>
                                <th>Enlace de Descarga</th>
                                <th>Protección</th>
                                <th>Expiración</th>
                                <th>Descargas</th>
                                <th class="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="7" class="text-center py-4 text-muted">
                                    <i class="fas fa-spinner fa-spin mr-2"></i> Cargando enlaces compartidos...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
