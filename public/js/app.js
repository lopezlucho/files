/**
 * Cloud Files Manager - Frontend Application Script
 */

// Disable Dropzone autodiscover globally
if (typeof Dropzone !== 'undefined') {
    Dropzone.autoDiscover = false;
}

const app = {
    source: (window.APP_CONFIG && window.APP_CONFIG.source) || 'local',
    currentPath: (window.APP_CONFIG && window.APP_CONFIG.currentPath) || '',
    filesTable: null,
    dropzoneInstance: null,

    init: function () {
        this.bindGlobalEvents();

        if ($('#tblFiles').length) {
            this.initFilesView();
        } else if ($('#tblUsbDevices').length) {
            this.initUsbView();
        } else if ($('#tblShares').length) {
            this.initSharesView();
        }
    },

    bindGlobalEvents: function () {
        const self = this;

        // Logout event
        $('#btnLogout').on('click', function (e) {
            e.preventDefault();
            Swal.fire({
                title: '¿Cerrar sesión?',
                text: 'Tendrás que iniciar sesión nuevamente para acceder.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, salir',
                cancelButtonText: 'Cancelar'
            }).then(function (result) {
                if (result.isConfirmed) {
                    $.post('/files/api/auth.php?action=logout', function () {
                        window.location.href = '/files/login';
                    });
                }
            });
        });

        // Quick Unmount from Navbar
        $('#btnQuickUnmount, #btnUnmountUsbAction').on('click', function (e) {
            e.preventDefault();
            self.unmountUsb();
        });

        // Change Password Form
        $('#formChangePassword').on('submit', function (e) {
            e.preventDefault();
            const $btn = $(this).find('button[type="submit"]');
            $btn.prop('disabled', true);

            $.ajax({
                url: '/files/api/auth.php?action=password',
                type: 'POST',
                data: $(this).serialize(),
                dataType: 'json',
                success: function (res) {
                    $btn.prop('disabled', false);
                    if (res.success) {
                        $('#modalChangePassword').modal('hide');
                        $('#formChangePassword')[0].reset();
                        Swal.fire({
                            icon: 'success',
                            title: 'Éxito',
                            text: res.message || 'Contraseña actualizada'
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: res.error || 'No se pudo cambiar la contraseña'
                        });
                    }
                },
                error: function () {
                    $btn.prop('disabled', false);
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error al contactar con el servidor' });
                }
            });
        });
    },

    /* =========================================================================
     * FILES EXPLORER VIEW
     * ========================================================================= */
    initFilesView: function () {
        const self = this;

        // Initialize DataTable
        self.filesTable = $('#tblFiles').DataTable({
            responsive: true,
            autoWidth: false,
            paging: true,
            pageLength: 25,
            lengthChange: true,
            searching: true,
            ordering: true,
            order: [[0, 'asc'], [1, 'asc']], // Folders first, then alphabetically
            language: {
                url: '/files/public/assets/plugins/Spanish.json'
            },
            columnDefs: [
                { orderable: false, targets: [0, 4] } // Icon and Actions not sortable
            ]
        });

        // Dropzone initialization
        const dropzoneElem = document.getElementById('filesDropzone');
        if (dropzoneElem) {
            self.dropzoneInstance = new Dropzone(dropzoneElem, {
                url: '/files/api/files.php?action=upload',
                paramName: 'file',
                maxFilesize: 2048, // 2GB
                parallelUploads: 2,
                timeout: 3600000,
                dictDefaultMessage: 'Arrastra tus archivos aquí para subirlos',
                dictFallbackMessage: 'Tu navegador no soporta subida de archivos mediante arrastrar y soltar.',
                dictFileTooBig: 'El archivo es demasiado grande ({{filesize}}MB). Tamaño máximo: {{maxFilesize}}MB.',
                sending: function (file, xhr, formData) {
                    formData.append('source', self.source);
                    formData.append('path', self.currentPath);
                },
                queuecomplete: function () {
                    Swal.fire({
                        icon: 'success',
                        title: 'Subida finalizada',
                        text: 'Los archivos han sido procesados correctamente.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    self.loadPath(self.currentPath);
                }
            });
        }

        // Open Upload Modal
        $('#btnOpenUpload').on('click', function () {
            if (self.dropzoneInstance) {
                self.dropzoneInstance.removeAllFiles();
            }
            $('#modalUpload').modal('show');
        });

        // Close upload modal button
        $('#btnCloseUpload').on('click', function () {
            self.loadPath(self.currentPath);
        });

        // Refresh Files
        $('#btnRefreshFiles').on('click', function () {
            self.loadPath(self.currentPath);
        });

        // New Folder Modal trigger
        $('#btnNewFolder').on('click', function () {
            $('#txtNewFolderName').val('');
            $('#modalNewFolder').modal('show');
            setTimeout(function () { $('#txtNewFolderName').focus(); }, 400);
        });

        // Submit New Folder Form
        $('#formNewFolder').on('submit', function (e) {
            e.preventDefault();
            const name = $('#txtNewFolderName').val().trim();
            if (!name) return;

            $.ajax({
                url: '/files/api/files.php?action=mkdir',
                type: 'POST',
                data: {
                    source: self.source,
                    path: self.currentPath,
                    name: name
                },
                dataType: 'json',
                success: function (res) {
                    if (res.success) {
                        $('#modalNewFolder').modal('hide');
                        Swal.fire({
                            icon: 'success',
                            title: 'Carpeta creada',
                            text: res.message,
                            timer: 1200,
                            showConfirmButton: false
                        });
                        self.loadPath(self.currentPath);
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: res.error });
                    }
                },
                error: function () {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error al comunicarse con el servidor' });
                }
            });
        });

        // Download Folder as Zip
        $('#btnDownloadZip').on('click', function () {
            const url = '/files/api/files.php?action=zip&source=' + encodeURIComponent(self.source) + '&path=' + encodeURIComponent(self.currentPath);
            window.location.href = url;
        });

        // Submit Rename Form
        $('#formRename').on('submit', function (e) {
            e.preventDefault();
            const path = $('#txtRenamePath').val();
            const newName = $('#txtRenameNewName').val().trim();
            if (!newName) return;

            $.ajax({
                url: '/files/api/files.php?action=rename',
                type: 'POST',
                data: {
                    source: self.source,
                    path: path,
                    new_name: newName
                },
                dataType: 'json',
                success: function (res) {
                    if (res.success) {
                        $('#modalRename').modal('hide');
                        Swal.fire({
                            icon: 'success',
                            title: 'Renombrado',
                            text: res.message,
                            timer: 1200,
                            showConfirmButton: false
                        });
                        self.loadPath(self.currentPath);
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: res.error });
                    }
                },
                error: function () {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error al contactar con el servidor' });
                }
            });
        });

        // Submit Share Form
        $('#formShare').on('submit', function (e) {
            e.preventDefault();
            const path = $('#txtSharePath').val();
            const password = $('#txtSharePassword').val();
            const expires = $('#selShareExpires').val();
            const $btn = $('#btnSubmitShare');

            $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i> Generando...');

            $.ajax({
                url: '/files/api/share.php?action=create',
                type: 'POST',
                data: {
                    source: self.source,
                    path: path,
                    password: password,
                    expires_hours: expires
                },
                dataType: 'json',
                success: function (res) {
                    $btn.prop('disabled', false).html('<i class="fas fa-link mr-1"></i> Generar Enlace');
                    if (res.success) {
                        const fullUrl = window.location.origin + res.share_url;
                        $('#txtGeneratedShareUrl').val(fullUrl);
                        $('#shareResultArea').slideDown();
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: res.error });
                    }
                },
                error: function () {
                    $btn.prop('disabled', false).html('<i class="fas fa-link mr-1"></i> Generar Enlace');
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error al comunicarse con el servidor' });
                }
            });
        });

        // Copy Share URL
        $('#btnCopyGeneratedUrl').on('click', function () {
            const input = document.getElementById('txtGeneratedShareUrl');
            input.select();
            input.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(input.value).then(function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Copiado',
                    text: 'Enlace copiado al portapapeles',
                    timer: 1200,
                    showConfirmButton: false
                });
            });
        });

        // Load initial path
        self.loadPath(self.currentPath);
    },

    loadPath: function (path) {
        const self = this;
        self.currentPath = path;

        $.ajax({
            url: '/files/api/files.php?action=list',
            type: 'GET',
            data: {
                source: self.source,
                path: path
            },
            dataType: 'json',
            success: function (res) {
                if (!res.success) {
                    Swal.fire({ icon: 'error', title: 'Error', text: res.error });
                    return;
                }

                // Render Breadcrumbs
                self.renderBreadcrumbs(res.breadcrumbs);

                // Render Storage Stats
                if (res.stats) {
                    $('#lblUsedSpace').text(res.stats.used_h);
                    $('#lblTotalSpace').text(res.stats.total_h);
                    $('#lblUsedPct').text(res.stats.used_percent + '%');
                    $('#barStorageUsage').css('width', res.stats.used_percent + '%');

                    // Color code storage bar
                    const bar = $('#barStorageUsage');
                    bar.removeClass('bg-primary bg-warning bg-danger');
                    if (res.stats.used_percent > 90) {
                        bar.addClass('bg-danger');
                    } else if (res.stats.used_percent > 75) {
                        bar.addClass('bg-warning');
                    } else {
                        bar.addClass('bg-primary');
                    }
                }

                // Populate DataTable
                self.filesTable.clear();

                // If in a subfolder, add '..' up-directory row
                if (path !== '') {
                    const parentParts = path.split('/');
                    parentParts.pop();
                    const parentPath = parentParts.join('/');

                    self.filesTable.row.add([
                        '<i class="fas fa-level-up-alt text-primary file-icon"></i>',
                        '<a href="javascript:void(0)" onclick="app.loadPath(\'' + escapeHtml(parentPath) + '\')" class="font-weight-bold text-primary">.. [Subir un nivel]</a>',
                        '-',
                        '-',
                        ''
                    ]);
                }

                res.items.forEach(function (item) {
                    const iconCol = '<i class="' + item.icon + ' file-icon"></i>';

                    let nameCol = '';
                    if (item.is_dir) {
                        nameCol = '<a href="javascript:void(0)" onclick="app.loadPath(\'' + escapeHtml(item.path) + '\')" class="font-weight-bold text-dark"><i class="fas fa-folder mr-1 text-warning"></i> ' + escapeHtml(item.name) + '</a>';
                    } else {
                        if (item.is_previewable) {
                            nameCol = '<a href="javascript:void(0)" onclick="app.openPreview(\'' + escapeHtml(item.path) + '\', \'' + escapeHtml(item.name) + '\', \'' + item.preview_type + '\', \'' + item.size_h + '\')" class="text-dark">' + escapeHtml(item.name) + '</a>';
                        } else {
                            nameCol = '<span class="text-dark">' + escapeHtml(item.name) + '</span>';
                        }
                    }

                    // Actions Column
                    let actionsCol = '<div class="btn-group btn-group-sm float-right">';

                    if (!item.is_dir && item.is_previewable) {
                        actionsCol += '<button type="button" class="btn btn-outline-info btn-action" onclick="app.openPreview(\'' + escapeHtml(item.path) + '\', \'' + escapeHtml(item.name) + '\', \'' + item.preview_type + '\', \'' + item.size_h + '\')" title="Vista previa"><i class="fas fa-eye"></i></button>';
                    }

                    if (item.is_dir) {
                        actionsCol += '<a href="/files/api/files.php?action=zip&source=' + encodeURIComponent(self.source) + '&path=' + encodeURIComponent(item.path) + '" class="btn btn-outline-secondary btn-action" title="Descargar como .ZIP"><i class="fas fa-file-archive"></i></a>';
                    } else {
                        actionsCol += '<a href="/files/api/files.php?action=download&source=' + encodeURIComponent(self.source) + '&path=' + encodeURIComponent(item.path) + '" class="btn btn-outline-success btn-action" title="Descargar"><i class="fas fa-download"></i></a>';
                    }

                    actionsCol += '<button type="button" class="btn btn-outline-primary btn-action" onclick="app.openShareModal(\'' + escapeHtml(item.path) + '\', \'' + escapeHtml(item.name) + '\')" title="Compartir enlace"><i class="fas fa-share-alt"></i></button>';
                    actionsCol += '<button type="button" class="btn btn-outline-warning btn-action" onclick="app.openRenameModal(\'' + escapeHtml(item.path) + '\', \'' + escapeHtml(item.name) + '\')" title="Renombrar"><i class="fas fa-edit"></i></button>';
                    actionsCol += '<button type="button" class="btn btn-outline-danger btn-action" onclick="app.deleteItem(\'' + escapeHtml(item.path) + '\', \'' + escapeHtml(item.name) + '\', ' + item.is_dir + ')" title="Eliminar"><i class="fas fa-trash-alt"></i></button>';
                    actionsCol += '</div>';

                    self.filesTable.row.add([
                        iconCol,
                        nameCol,
                        item.size_h,
                        item.modified_h,
                        actionsCol
                    ]);
                });

                self.filesTable.draw();
            },
            error: function () {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el directorio' });
            }
        });
    },

    renderBreadcrumbs: function (breadcrumbs) {
        const self = this;
        const $ol = $('#fileBreadcrumbs');
        $ol.empty();

        breadcrumbs.forEach(function (bc, idx) {
            const isLast = (idx === breadcrumbs.length - 1);
            if (isLast) {
                $ol.append('<li class="breadcrumb-item active font-weight-bold text-dark">' + escapeHtml(bc.name) + '</li>');
            } else {
                $ol.append('<li class="breadcrumb-item"><a href="javascript:void(0)" onclick="app.loadPath(\'' + escapeHtml(bc.path) + '\')">' + escapeHtml(bc.name) + '</a></li>');
            }
        });
    },

    openPreview: function (path, name, type, sizeStr) {
        const self = this;
        $('#lblPreviewTitle').html('<i class="fas fa-eye mr-2"></i> ' + escapeHtml(name));
        $('#lblPreviewSize').text('Tamaño: ' + sizeStr);
        $('#btnDownloadFromPreview').attr('href', '/files/api/files.php?action=download&source=' + encodeURIComponent(self.source) + '&path=' + encodeURIComponent(path));

        const $container = $('#previewContainer');
        $container.html('<div class="py-5"><i class="fas fa-spinner fa-spin fa-3x text-primary"></i><p class="mt-2 text-muted">Cargando previsualización...</p></div>');
        $('#modalPreview').modal('show');

        const previewUrl = '/files/api/files.php?action=preview&source=' + encodeURIComponent(self.source) + '&path=' + encodeURIComponent(path);

        if (type === 'image') {
            $container.html('<img src="' + previewUrl + '" class="img-fluid rounded shadow-sm" style="max-height: 65vh;">');
        } else if (type === 'pdf') {
            $container.html('<iframe src="' + previewUrl + '" style="width: 100%; height: 65vh; border: none;" class="rounded shadow-sm"></iframe>');
        } else if (type === 'video') {
            $container.html('<video controls autoplay class="w-100 rounded shadow-sm" style="max-height: 65vh;"><source src="' + previewUrl + '">Tu navegador no soporta reproducción de video.</video>');
        } else if (type === 'audio') {
            $container.html('<div class="py-5"><i class="fas fa-music fa-4x text-info mb-3"></i><br><audio controls class="w-70"><source src="' + previewUrl + '">Tu navegador no soporta audio.</audio></div>');
        } else if (type === 'text') {
            $.getJSON(previewUrl, function (res) {
                if (res.success) {
                    $container.html('<pre class="preview-text">' + escapeHtml(res.content) + '</pre>');
                } else {
                    $container.html('<div class="alert alert-danger">Error al cargar texto: ' + escapeHtml(res.error) + '</div>');
                }
            }).fail(function () {
                $container.html('<div class="alert alert-danger">Error al obtener el contenido del archivo.</div>');
            });
        } else {
            $container.html('<div class="py-4 text-muted"><i class="fas fa-file fa-4x mb-2"></i><p>Este formato de archivo no soporta previsualización en el navegador.</p></div>');
        }
    },

    openRenameModal: function (path, currentName) {
        $('#txtRenamePath').val(path);
        $('#txtRenameNewName').val(currentName);
        $('#modalRename').modal('show');
        setTimeout(function () { $('#txtRenameNewName').focus().select(); }, 400);
    },

    openShareModal: function (path, name) {
        $('#txtSharePath').val(path);
        $('#lblShareItemName').text(name);
        $('#txtSharePassword').val('');
        $('#selShareExpires').val('');
        $('#shareResultArea').hide();
        $('#txtGeneratedShareUrl').val('');
        $('#modalShare').modal('show');
    },

    deleteItem: function (path, name, isDir) {
        const self = this;
        const itemType = isDir ? 'la carpeta y todo su contenido' : 'el archivo';

        Swal.fire({
            title: '¿Eliminar ' + (isDir ? 'carpeta' : 'archivo') + '?',
            text: '¿Estás seguro de que deseas eliminar ' + itemType + ' "' + name + '"? Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(function (result) {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/files/api/files.php?action=delete',
                    type: 'POST',
                    data: {
                        source: self.source,
                        path: path
                    },
                    dataType: 'json',
                    success: function (res) {
                        if (res.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Eliminado',
                                text: res.message,
                                timer: 1200,
                                showConfirmButton: false
                            });
                            self.loadPath(self.currentPath);
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error', text: res.error });
                        }
                    },
                    error: function () {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al contactar con el servidor' });
                    }
                });
            }
        });
    },

    /* =========================================================================
     * USB DEVICES MANAGEMENT VIEW
     * ========================================================================= */
    initUsbView: function () {
        const self = this;

        $('#btnRefreshUsb').on('click', function () {
            self.loadUsbDevices();
        });

        self.loadUsbDevices();
    },

    loadUsbDevices: function () {
        const self = this;
        const $tbody = $('#tblUsbDevices tbody');
        $tbody.html('<tr><td colspan="7" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin mr-2"></i> Escaneando dispositivos de almacenamiento...</td></tr>');

        $.getJSON('/files/api/usb.php?action=devices', function (res) {
            $tbody.empty();
            if (!res.success) {
                $tbody.html('<tr><td colspan="7" class="text-center py-3 text-danger"><i class="fas fa-exclamation-circle mr-1"></i> ' + escapeHtml(res.error) + '</td></tr>');
                return;
            }

            if (!res.devices || res.devices.length === 0) {
                $tbody.html('<tr><td colspan="7" class="text-center py-4 text-muted"><i class="fas fa-info-circle mr-1"></i> No se detectaron particiones o discos extraíbles disponibles.</td></tr>');
                return;
            }

            res.devices.forEach(function (dev) {
                let badgeClass = 'badge-secondary';
                let statusText = 'No montado';
                let actionBtn = '';

                if (dev.is_mounted_here) {
                    badgeClass = 'badge-success';
                    statusText = 'Montado en /media/usb';
                    actionBtn = '<div class="btn-group btn-group-sm">' +
                        '<a href="/files/?source=usb" class="btn btn-outline-primary btn-sm"><i class="fas fa-folder-open mr-1"></i> Explorar</a>' +
                        '<button class="btn btn-danger btn-sm" onclick="app.unmountUsb()"><i class="fas fa-eject mr-1"></i> Desmontar</button>' +
                        '</div>';
                } else if (dev.is_mounted) {
                    badgeClass = 'badge-info';
                    statusText = dev.mountpoint;
                    actionBtn = '<button class="btn btn-outline-secondary btn-sm" disabled><i class="fas fa-lock mr-1"></i> En uso</button>';
                } else {
                    actionBtn = '<button class="btn btn-success btn-sm" onclick="app.mountUsb(\'' + escapeHtml(dev.device_path) + '\')"><i class="fas fa-plug mr-1"></i> Montar en /media/usb</button>';
                }

                const row = '<tr>' +
                    '<td><strong>' + escapeHtml(dev.device_path) + '</strong></td>' +
                    '<td>' + (dev.label ? '<span class="badge badge-light border">' + escapeHtml(dev.label) + '</span>' : '<span class="text-muted">Sin etiqueta</span>') + '</td>' +
                    '<td>' + escapeHtml(dev.model || '-') + '</td>' +
                    '<td><span class="badge badge-secondary">' + escapeHtml(dev.fstype || 'desconocido') + '</span></td>' +
                    '<td><strong>' + escapeHtml(dev.size) + '</strong></td>' +
                    '<td><span class="badge ' + badgeClass + '">' + statusText + '</span></td>' +
                    '<td class="text-right">' + actionBtn + '</td>' +
                    '</tr>';

                $tbody.append(row);
            });
        }).fail(function () {
            $tbody.html('<tr><td colspan="7" class="text-center py-3 text-danger"><i class="fas fa-exclamation-triangle mr-1"></i> Error al conectar con el servicio USB.</td></tr>');
        });
    },

    mountUsb: function (devicePath) {
        const self = this;
        Swal.fire({
            title: 'Montando unidad...',
            text: 'Espere mientras se monta ' + devicePath + ' en /media/usb',
            allowOutsideClick: false,
            didOpen: function () {
                Swal.showLoading();
            }
        });

        $.ajax({
            url: '/files/api/usb.php?action=mount',
            type: 'POST',
            data: { device: devicePath },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Unidad Montada!',
                        text: res.message,
                        showCancelButton: true,
                        confirmButtonText: '<i class="fas fa-folder-open mr-1"></i> Explorar Archivos',
                        cancelButtonText: 'Quedarse aquí'
                    }).then(function (result) {
                        if (result.isConfirmed) {
                            window.location.href = '/files/?source=usb';
                        } else {
                            window.location.reload();
                        }
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Error al montar', text: res.error });
                }
            },
            error: function () {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al contactar con el servidor' });
            }
        });
    },

    unmountUsb: function () {
        const self = this;
        Swal.fire({
            title: '¿Desmontar unidad USB?',
            text: 'Asegúrate de que no haya transferencias de archivos en curso antes de continuar.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, expulsar / desmontar',
            cancelButtonText: 'Cancelar'
        }).then(function (result) {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Desmontando...',
                    allowOutsideClick: false,
                    didOpen: function () { Swal.showLoading(); }
                });

                $.ajax({
                    url: '/files/api/usb.php?action=unmount',
                    type: 'POST',
                    dataType: 'json',
                    success: function (res) {
                        if (res.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Desmontado',
                                text: res.message,
                                timer: 1500,
                                showConfirmButton: false
                            }).then(function () {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error', text: res.error });
                        }
                    },
                    error: function () {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al contactar con el servidor' });
                    }
                });
            }
        });
    },

    /* =========================================================================
     * SHARES MANAGEMENT VIEW
     * ========================================================================= */
    initSharesView: function () {
        const self = this;

        $('#btnRefreshShares').on('click', function () {
            self.loadShares();
        });

        self.loadShares();
    },

    loadShares: function () {
        const self = this;
        const $tbody = $('#tblShares tbody');
        $tbody.html('<tr><td colspan="7" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando enlaces compartidos...</td></tr>');

        $.getJSON('/files/api/share.php?action=list', function (res) {
            $tbody.empty();
            if (!res.success) {
                $tbody.html('<tr><td colspan="7" class="text-center py-3 text-danger">' + escapeHtml(res.error) + '</td></tr>');
                return;
            }

            if (!res.shares || res.shares.length === 0) {
                $tbody.html('<tr><td colspan="7" class="text-center py-4 text-muted"><i class="fas fa-info-circle mr-1"></i> No has generado enlaces compartidos todavía.</td></tr>');
                return;
            }

            res.shares.forEach(function (s) {
                const fullUrl = window.location.origin + s.share_url;
                const icon = s.is_folder ? '<i class="fas fa-folder text-warning mr-1"></i>' : '<i class="fas fa-file text-primary mr-1"></i>';

                let passBadge = s.has_password
                    ? '<span class="badge badge-warning"><i class="fas fa-key mr-1"></i> Protegido</span>'
                    : '<span class="badge badge-success"><i class="fas fa-globe mr-1"></i> Público</span>';

                let expBadge = s.is_expired
                    ? '<span class="badge badge-danger">Expirado</span>'
                    : '<span class="badge badge-light border">' + escapeHtml(s.expires_h) + '</span>';

                const row = '<tr>' +
                    '<td>' + icon + ' <strong>' + escapeHtml(s.filename) + '</strong></td>' +
                    '<td><span class="badge ' + (s.source === 'usb' ? 'badge-info' : 'badge-primary') + '">' + s.source.toUpperCase() + '</span></td>' +
                    '<td><div class="input-group input-group-sm" style="max-width: 320px;">' +
                    '<input type="text" class="form-control" value="' + escapeHtml(fullUrl) + '" readonly id="shareUrl_' + s.token + '">' +
                    '<div class="input-group-append">' +
                    '<button class="btn btn-outline-secondary" type="button" onclick="app.copyShareLink(\'' + s.token + '\')" title="Copiar enlace"><i class="fas fa-copy"></i></button>' +
                    '</div>' +
                    '</div></td>' +
                    '<td>' + passBadge + '</td>' +
                    '<td>' + expBadge + '</td>' +
                    '<td><span class="badge badge-pill badge-secondary">' + s.downloads + '</span></td>' +
                    '<td class="text-right">' +
                    '<a href="' + escapeHtml(s.share_url) + '" target="_blank" class="btn btn-outline-info btn-sm mr-1" title="Ver"><i class="fas fa-external-link-alt"></i></a>' +
                    '<button type="button" class="btn btn-outline-danger btn-sm" onclick="app.deleteShare(\'' + s.token + '\')" title="Revocar enlace"><i class="fas fa-trash-alt"></i></button>' +
                    '</td>' +
                    '</tr>';

                $tbody.append(row);
            });
        }).fail(function () {
            $tbody.html('<tr><td colspan="7" class="text-center py-3 text-danger">Error al cargar enlaces compartidos.</td></tr>');
        });
    },

    copyShareLink: function (token) {
        const input = document.getElementById('shareUrl_' + token);
        if (input) {
            input.select();
            input.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(input.value).then(function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Copiado',
                    text: 'Enlace copiado al portapapeles',
                    timer: 1200,
                    showConfirmButton: false
                });
            });
        }
    },

    deleteShare: function (token) {
        const self = this;
        Swal.fire({
            title: '¿Revocar enlace?',
            text: 'Cualquier persona que tenga este enlace ya no podrá descargar el archivo o carpeta.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, revocar enlace',
            cancelButtonText: 'Cancelar'
        }).then(function (result) {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/files/api/share.php?action=delete',
                    type: 'POST',
                    data: { token: token },
                    dataType: 'json',
                    success: function (res) {
                        if (res.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Revocado',
                                text: 'El enlace ha sido eliminado',
                                timer: 1200,
                                showConfirmButton: false
                            });
                            self.loadShares();
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error', text: res.error });
                        }
                    },
                    error: function () {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al contactar con el servidor' });
                    }
                });
            }
        });
    }
};

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

$(document).ready(function () {
    app.init();
});
