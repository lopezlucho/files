    </div>
    <!-- /.content-wrapper -->

    <!-- Main Footer -->
    <footer class="main-footer text-sm">
        <div class="float-right d-none d-sm-inline">
            <b>Versión</b> <?= htmlspecialchars(APP_VERSION) ?>
        </div>
        <strong><?= htmlspecialchars(APP_NAME) ?></strong> &copy; <?= date('Y') ?> &bull; Gestor de Archivos en la Nube con Soporte USB.
    </footer>
</div>
<!-- ./wrapper -->

<!-- MODAL: Subir Archivos (Dropzone) -->
<div class="modal fade" id="modalUpload" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content shadow-lg">
            <div class="modal-header bg-primary text-white py-2">
                <h5 class="modal-title font-weight-bold">
                    <i class="fas fa-cloud-upload-alt mr-2"></i> Subir Archivos
                </h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Cerrar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body p-4">
                <p class="text-muted small mb-3">
                    Arrastra tus archivos aquí o haz clic para seleccionarlos desde tu equipo. Los archivos se guardarán en la carpeta actual.
                </p>
                <form action="<?= BASE_URL ?>/api/files.php?action=upload" class="dropzone" id="filesDropzone">
                    <div class="dz-message text-center">
                        <i class="fas fa-folder-upload fa-3x text-primary mb-2"></i>
                        <h5 class="mb-1">Arrastra y suelta tus archivos aquí</h5>
                        <p class="text-muted small">o haz clic para explorar tu dispositivo</p>
                    </div>
                </form>
            </div>
            <div class="modal-footer py-2">
                <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal" id="btnCloseUpload">Cerrar y Actualizar</button>
            </div>
        </div>
    </div>
</div>

<!-- MODAL: Nueva Carpeta -->
<div class="modal fade" id="modalNewFolder" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content shadow">
            <div class="modal-header py-2">
                <h5 class="modal-title font-weight-bold">
                    <i class="fas fa-folder-plus text-primary mr-2"></i> Nueva Carpeta
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Cerrar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="formNewFolder">
                <div class="modal-body">
                    <div class="form-group mb-0">
                        <label for="txtNewFolderName" class="font-weight-normal">Nombre de la carpeta:</label>
                        <input type="text" class="form-control" id="txtNewFolderName" name="name" required placeholder="Ej. Documentos, Facturas..." autocomplete="off">
                    </div>
                </div>
                <div class="modal-footer py-2">
                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary btn-sm font-weight-bold" id="btnSubmitNewFolder">
                        <i class="fas fa-check mr-1"></i> Crear Carpeta
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- MODAL: Renombrar -->
<div class="modal fade" id="modalRename" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content shadow">
            <div class="modal-header py-2">
                <h5 class="modal-title font-weight-bold">
                    <i class="fas fa-edit text-info mr-2"></i> Renombrar Elemento
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Cerrar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="formRename">
                <input type="hidden" id="txtRenamePath" name="path">
                <div class="modal-body">
                    <div class="form-group mb-0">
                        <label for="txtRenameNewName" class="font-weight-normal">Nuevo nombre:</label>
                        <input type="text" class="form-control" id="txtRenameNewName" name="new_name" required autocomplete="off">
                    </div>
                </div>
                <div class="modal-footer py-2">
                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary btn-sm font-weight-bold" id="btnSubmitRename">
                        <i class="fas fa-save mr-1"></i> Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- MODAL: Compartir Enlace -->
<div class="modal fade" id="modalShare" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content shadow">
            <div class="modal-header py-2">
                <h5 class="modal-title font-weight-bold">
                    <i class="fas fa-share-alt text-primary mr-2"></i> Compartir Enlace Público
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Cerrar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="formShare">
                <input type="hidden" id="txtSharePath" name="path">
                <div class="modal-body">
                    <p class="mb-3">
                        Compartiendo: <b id="lblShareItemName" class="text-primary"></b>
                    </p>
                    <div class="form-group">
                        <label for="txtSharePassword" class="font-weight-normal"><i class="fas fa-lock mr-1"></i> Contraseña (Opcional):</label>
                        <input type="password" class="form-control form-control-sm" id="txtSharePassword" name="password" placeholder="Dejar vacío si es público para todos">
                    </div>
                    <div class="form-group mb-3">
                        <label for="selShareExpires" class="font-weight-normal"><i class="fas fa-clock mr-1"></i> Tiempo de Expiración:</label>
                        <select class="form-control form-control-sm" id="selShareExpires" name="expires_hours">
                            <option value="">Sin límite de tiempo (Permanente)</option>
                            <option value="1">1 Hora</option>
                            <option value="6">6 Horas</option>
                            <option value="24">24 Horas (1 Día)</option>
                            <option value="72">3 Días</option>
                            <option value="168">7 Días (1 Semana)</option>
                            <option value="720">30 Días (1 Mes)</option>
                        </select>
                    </div>

                    <div id="shareResultArea" style="display: none;">
                        <hr>
                        <label class="text-success font-weight-bold"><i class="fas fa-link mr-1"></i> Enlace Generado:</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="txtGeneratedShareUrl" readonly>
                            <div class="input-group-append">
                                <button type="button" class="btn btn-outline-primary" id="btnCopyGeneratedUrl">
                                    <i class="fas fa-copy mr-1"></i> Copiar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer py-2">
                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cerrar</button>
                    <button type="submit" class="btn btn-primary btn-sm font-weight-bold" id="btnSubmitShare">
                        <i class="fas fa-link mr-1"></i> Generar Enlace
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- MODAL: Previsualización de Archivos -->
<div class="modal fade" id="modalPreview" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content shadow-lg">
            <div class="modal-header py-2 bg-dark text-white">
                <h5 class="modal-title font-weight-bold" id="lblPreviewTitle">
                    <i class="fas fa-file mr-2"></i> Vista Previa
                </h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Cerrar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body p-3">
                <div class="preview-container text-center" id="previewContainer">
                    <!-- Dynamic Preview Content -->
                </div>
            </div>
            <div class="modal-footer py-2 bg-light d-flex justify-content-between">
                <div>
                    <span class="text-muted small" id="lblPreviewSize"></span>
                </div>
                <div>
                    <a href="#" class="btn btn-primary btn-sm font-weight-bold" id="btnDownloadFromPreview" download>
                        <i class="fas fa-download mr-1"></i> Descargar
                    </a>
                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- MODAL: Cambiar Contraseña -->
<div class="modal fade" id="modalChangePassword" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content shadow">
            <div class="modal-header py-2">
                <h5 class="modal-title font-weight-bold">
                    <i class="fas fa-key text-warning mr-2"></i> Cambiar Contraseña
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Cerrar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="formChangePassword">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="txtOldPass" class="font-weight-normal">Contraseña actual:</label>
                        <input type="password" class="form-control" id="txtOldPass" name="old_password" required>
                    </div>
                    <div class="form-group mb-0">
                        <label for="txtNewPass" class="font-weight-normal">Nueva contraseña:</label>
                        <input type="password" class="form-control" id="txtNewPass" name="new_password" required minlength="6">
                        <small class="form-text text-muted">Mínimo 6 caracteres.</small>
                    </div>
                </div>
                <div class="modal-footer py-2">
                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-warning btn-sm font-weight-bold">
                        <i class="fas fa-save mr-1"></i> Actualizar Contraseña
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- REQUIRED SCRIPTS -->
<script src="<?= BASE_URL ?>/public/assets/plugins/jquery/jquery.min.js"></script>
<script src="<?= BASE_URL ?>/public/assets/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="<?= BASE_URL ?>/public/assets/dist/js/adminlte.min.js"></script>

<!-- DataTables & Plugins -->
<script src="<?= BASE_URL ?>/public/assets/plugins/datatables/jquery.dataTables.min.js"></script>
<script src="<?= BASE_URL ?>/public/assets/plugins/datatables-bs4/js/dataTables.bootstrap4.min.js"></script>
<script src="<?= BASE_URL ?>/public/assets/plugins/datatables-responsive/js/dataTables.responsive.min.js"></script>
<script src="<?= BASE_URL ?>/public/assets/plugins/datatables-responsive/js/responsive.bootstrap4.min.js"></script>

<!-- SweetAlert2 -->
<script src="<?= BASE_URL ?>/public/assets/plugins/sweetalert2/sweetalert2.min.js"></script>

<!-- Dropzone -->
<script src="<?= BASE_URL ?>/public/assets/plugins/dropzone/min/dropzone.min.js"></script>

<!-- Main App JS -->
<script src="<?= BASE_URL ?>/public/js/app.js"></script>

</body>
</html>
