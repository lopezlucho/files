/**
 * Cloud Files Manager - Dual Panel Commander Mode
 * Compatible with Midnight Commander / Norton Commander UX
 */

// Disable Dropzone autodiscover
if (typeof Dropzone !== 'undefined') {
    Dropzone.autoDiscover = false;
}

const app = {
    activePanel: 'left', // 'left' or 'right'
    panels: {
        left: {
            key: 'left',
            source: 'local',
            path: '',
            items: [],
            filteredIndices: [],
            selectedIndices: new Set(),
            focusedIndex: 0,
            stats: null
        },
        right: {
            key: 'right',
            source: 'local',
            path: '',
            items: [],
            filteredIndices: [],
            selectedIndices: new Set(),
            focusedIndex: 0,
            stats: null
        }
    },
    dropzoneInstance: null,
    uploadTargetPanel: 'left',

    init: function () {
        this.bindGlobalEvents();

        if ($('#panel-left').length && $('#panel-right').length) {
            this.initCommanderView();
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
                        Swal.fire({ icon: 'success', title: 'Éxito', text: res.message || 'Contraseña actualizada' });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: res.error || 'No se pudo cambiar la contraseña' });
                    }
                },
                error: function () {
                    $btn.prop('disabled', false);
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error al contactar con el servidor' });
                }
            });
        });

        // Save Editor via Button
        $('#btnSaveEditor, #btnSaveEditorBottom').on('click', function () {
            self.saveEditorContent();
        });

        // Editor Cursor tracking
        $('#txtEditorContent').on('keyup click input', function () {
            self.updateEditorStats();
        });

        // Global Keydown Handler (Keyboard Shortcuts & Commander Mode)
        $(document).on('keydown', function (e) {
            // When editor modal is open, intercept Ctrl+S and F2
            if ($('#modalEditor').is(':visible')) {
                if ((e.ctrlKey && e.key.toLowerCase() === 's') || e.key === 'F2') {
                    e.preventDefault();
                    self.saveEditorContent();
                    return;
                }
                return;
            }

            // If user is currently typing in an input or modal, do not capture commander keys
            if ($(e.target).is('input, textarea, select')) {
                if (e.key === 'Escape') {
                    $(e.target).blur();
                }
                return;
            }

            // If any modal is visible, let modal handle keys
            if ($('.modal.show').length > 0) {
                return;
            }

            // Handle Commander Keys
            self.handleCommanderKey(e);
        });
    },

    /* =========================================================================
     * COMMANDER DUAL PANEL VIEW
     * ========================================================================= */
    initCommanderView: function () {
        const self = this;

        // Click to focus panel
        $('.commander-panel').on('click', function () {
            const panelKey = $(this).data('panel');
            self.setActivePanel(panelKey);
        });

        // Quick filter input handlers
        $('#filter-left').on('input', function () {
            self.filterPanel('left', $(this).val());
        });
        $('#filter-right').on('input', function () {
            self.filterPanel('right', $(this).val());
        });

        // Checkbox "Select All"
        $('.chk-select-all').on('change', function () {
            const panelKey = $(this).data('panel');
            const checked = $(this).is(':checked');
            self.selectAll(panelKey, checked);
        });

        // Initialize Dropzone
        const dropzoneElem = document.getElementById('filesDropzone');
        if (dropzoneElem) {
            self.dropzoneInstance = new Dropzone(dropzoneElem, {
                url: '/files/api/files.php?action=upload',
                paramName: 'file',
                maxFilesize: 4096, // 4GB
                parallelUploads: 2,
                timeout: 3600000,
                dictDefaultMessage: 'Arrastra tus archivos aquí para subirlos',
                sending: function (file, xhr, formData) {
                    const panel = self.panels[self.uploadTargetPanel];
                    formData.append('source', panel.source);
                    formData.append('path', panel.path);
                },
                queuecomplete: function () {
                    Swal.fire({
                        icon: 'success',
                        title: 'Subida finalizada',
                        timer: 1200,
                        showConfirmButton: false
                    });
                    self.loadPanelPath(self.uploadTargetPanel, self.panels[self.uploadTargetPanel].path);
                }
            });
        }

        // Close upload modal button
        $('#btnCloseUpload').on('click', function () {
            self.loadPanelPath(self.uploadTargetPanel, self.panels[self.uploadTargetPanel].path);
        });

        // Load both panels initially
        self.loadPanelPath('left', '');
        self.loadPanelPath('right', '');
    },

    setActivePanel: function (panelKey) {
        if (panelKey !== 'left' && panelKey !== 'right') return;
        this.activePanel = panelKey;

        // Visual highlight on active panel
        $('.commander-panel').removeClass('panel-active');
        $('#panel-' + panelKey).addClass('panel-active');

        // Update badge text
        $('#panel-left .panel-badge-indicator').html(panelKey === 'left' ? '<i class="fas fa-arrow-right mr-1"></i> PANEL IZQUIERDO [ACTIVO]' : 'PANEL IZQUIERDO');
        $('#panel-right .panel-badge-indicator').html(panelKey === 'right' ? '<i class="fas fa-arrow-right mr-1"></i> PANEL DERECHO [ACTIVO]' : 'PANEL DERECHO');

        if (panelKey === 'left') {
            $('#panel-left .panel-badge-indicator').removeClass('badge-secondary').addClass('badge-primary');
            $('#panel-right .panel-badge-indicator').removeClass('badge-primary').addClass('badge-secondary');
        } else {
            $('#panel-right .panel-badge-indicator').removeClass('badge-secondary').addClass('badge-primary');
            $('#panel-left .panel-badge-indicator').removeClass('badge-primary').addClass('badge-secondary');
        }

        this.highlightFocusedRow(panelKey);
    },

    switchActivePanel: function () {
        const nextPanel = (this.activePanel === 'left') ? 'right' : 'left';
        this.setActivePanel(nextPanel);
    },

    setPanelSource: function (panelKey, source) {
        const p = this.panels[panelKey];
        if (p.source === source) return;

        if (source === 'usb' && !window.APP_CONFIG.isUsbMounted) {
            Swal.fire({
                icon: 'warning',
                title: 'USB no montada',
                text: 'Debes montar una unidad USB en /media/usb para poder explorarla.',
                confirmButtonText: 'Ir a Montar USB',
                showCancelButton: true
            }).then(function (res) {
                if (res.isConfirmed) {
                    window.location.href = '/files/?view=usb';
                }
            });
            return;
        }

        p.source = source;
        $('#panel-' + panelKey + ' .btn-src-local').toggleClass('active', source === 'local');
        $('#panel-' + panelKey + ' .btn-src-usb').toggleClass('active', source === 'usb');

        this.setActivePanel(panelKey);
        this.loadPanelPath(panelKey, '');
    },

    loadPanelPath: function (panelKey, path) {
        const self = this;
        const p = self.panels[panelKey];
        p.path = path;
        p.selectedIndices.clear();
        p.focusedIndex = 0;

        const $tbody = $('#tbody-' + panelKey);
        $tbody.html('<tr><td colspan="5" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando...</td></tr>');

        $.ajax({
            url: '/files/api/files.php?action=list',
            type: 'GET',
            data: { source: p.source, path: path },
            dataType: 'json',
            success: function (res) {
                if (!res.success) {
                    $tbody.html('<tr><td colspan="5" class="text-center py-3 text-danger"><i class="fas fa-exclamation-circle mr-1"></i> ' + escapeHtml(res.error) + '</td></tr>');
                    return;
                }

                p.stats = res.stats;
                self.renderBreadcrumbs(panelKey, res.breadcrumbs);

                // Render disk stats
                if (res.stats) {
                    $('#stats-' + panelKey).html('<i class="fas fa-database mr-1"></i> Libre: <b>' + res.stats.free_h + '</b> (' + (100 - res.stats.used_percent).toFixed(1) + '%)');
                }

                // Build Items with '..' if subfolder
                const items = [];
                if (path !== '') {
                    const parts = path.split('/');
                    parts.pop();
                    const parentPath = parts.join('/');
                    items.push({
                        is_up: true,
                        name: '.. [Subir un nivel]',
                        path: parentPath,
                        is_dir: true,
                        size_h: '<DIR>',
                        modified_h: '',
                        icon: 'fas fa-level-up-alt text-primary'
                    });
                }

                res.items.forEach(function (it) {
                    items.push(it);
                });

                p.items = items;
                self.filterPanel(panelKey, $('#filter-' + panelKey).val());
            },
            error: function () {
                $tbody.html('<tr><td colspan="5" class="text-center py-3 text-danger">Error al cargar contenido.</td></tr>');
            }
        });
    },

    filterPanel: function (panelKey, query) {
        const p = this.panels[panelKey];
        query = (query || '').toLowerCase().trim();

        p.filteredIndices = [];
        p.items.forEach(function (item, idx) {
            if (item.is_up) {
                p.filteredIndices.push(idx);
                return;
            }
            if (query === '' || item.name.toLowerCase().indexOf(query) !== -1) {
                p.filteredIndices.push(idx);
            }
        });

        p.focusedIndex = Math.min(p.focusedIndex, Math.max(0, p.filteredIndices.length - 1));
        this.renderPanelTable(panelKey);
    },

    renderPanelTable: function (panelKey) {
        const self = this;
        const p = self.panels[panelKey];
        const $tbody = $('#tbody-' + panelKey);
        $tbody.empty();

        if (p.filteredIndices.length === 0) {
            $tbody.html('<tr><td colspan="5" class="text-center py-4 text-muted"><i class="fas fa-folder-open fa-2x text-muted mb-2"></i><br>Carpeta vacía</td></tr>');
            self.updatePanelSummary(panelKey);
            return;
        }

        p.filteredIndices.forEach(function (rawIndex, displayIndex) {
            const item = p.items[rawIndex];
            const isSelected = p.selectedIndices.has(rawIndex);
            const isFocused = (displayIndex === p.focusedIndex);

            let rowClass = '';
            if (isSelected) rowClass += ' row-selected';
            if (isFocused && self.activePanel === panelKey) rowClass += ' row-focused';

            const chkHtml = item.is_up ? '' :
                '<input type="checkbox" class="chk-item" data-panel="' + panelKey + '" data-idx="' + rawIndex + '" ' + (isSelected ? 'checked' : '') + ' onclick="event.stopPropagation()">';

            const nameHtml = item.is_dir ?
                (item.is_up ? '<strong class="text-primary">' + escapeHtml(item.name) + '</strong>' : '<strong class="text-dark">' + escapeHtml(item.name) + '</strong>') :
                '<span class="text-dark">' + escapeHtml(item.name) + '</span>';

            const row = $('<tr class="' + rowClass + '" data-display-idx="' + displayIndex + '" data-raw-idx="' + rawIndex + '">' +
                '<td class="text-center">' + chkHtml + '</td>' +
                '<td class="text-center"><i class="' + item.icon + '"></i></td>' +
                '<td>' + nameHtml + '</td>' +
                '<td class="text-right small text-muted font-weight-bold">' + (item.is_dir ? '&lt;DIR&gt;' : item.size_h) + '</td>' +
                '<td class="text-right small text-muted">' + escapeHtml(item.modified_h || '') + '</td>' +
                '</tr>');

            // Click row to focus and activate panel (WITHOUT destroying DOM so dblclick works)
            row.on('click', function (e) {
                if ($(e.target).is('input[type="checkbox"]')) return;
                self.setActivePanel(panelKey);
                p.focusedIndex = displayIndex;
                $tbody.find('tr').removeClass('row-focused');
                row.addClass('row-focused');
            });

            // Double click to open folder or preview file
            row.on('dblclick', function (e) {
                e.preventDefault();
                self.activateItem(panelKey, item);
            });

            // Checkbox change
            row.find('.chk-item').on('change', function () {
                self.toggleItemSelection(panelKey, rawIndex);
            });

            $tbody.append(row);
        });

        self.scrollFocusedIntoView(panelKey);
        self.updatePanelSummary(panelKey);
    },

    renderBreadcrumbs: function (panelKey, breadcrumbs) {
        const $ol = $('#breadcrumbs-' + panelKey);
        $ol.empty();

        breadcrumbs.forEach(function (bc, idx) {
            const isLast = (idx === breadcrumbs.length - 1);
            if (isLast) {
                $ol.append('<li class="breadcrumb-item active font-weight-bold text-truncate" style="max-width: 140px;">' + escapeHtml(bc.name) + '</li>');
            } else {
                $ol.append('<li class="breadcrumb-item"><a href="javascript:void(0)" onclick="app.loadPanelPath(\'' + panelKey + '\', \'' + escapeHtml(bc.path) + '\')">' + escapeHtml(bc.name) + '</a></li>');
            }
        });
    },

    updatePanelSummary: function (panelKey) {
        const p = this.panels[panelKey];
        let totalFiles = 0;
        let selectedCount = p.selectedIndices.size;
        let selectedBytes = 0;

        p.items.forEach(function (it, idx) {
            if (!it.is_up) {
                totalFiles++;
                if (p.selectedIndices.has(idx)) {
                    selectedBytes += (it.size || 0);
                }
            }
        });

        const selectedStr = selectedCount > 0 ?
            ' | <b class="text-primary">' + selectedCount + ' seleccionados</b> (' + this.formatBytes(selectedBytes) + ')' :
            ' | 0 seleccionados';

        $('#summary-' + panelKey).html('<b>' + totalFiles + '</b> elementos' + selectedStr);
    },

    highlightFocusedRow: function (panelKey) {
        const p = this.panels[panelKey];
        $('#tbl-' + panelKey + ' tbody tr').removeClass('row-focused');

        if (this.activePanel === panelKey) {
            const $row = $('#tbl-' + panelKey + ' tbody tr[data-display-idx="' + p.focusedIndex + '"]');
            $row.addClass('row-focused');
            this.scrollFocusedIntoView(panelKey);
        }
    },

    scrollFocusedIntoView: function (panelKey) {
        const p = this.panels[panelKey];
        const container = $('#panel-' + panelKey + ' .panel-table-container')[0];
        const row = $('#tbl-' + panelKey + ' tbody tr[data-display-idx="' + p.focusedIndex + '"]')[0];

        if (container && row) {
            const cTop = container.scrollTop;
            const cBottom = cTop + container.clientHeight;
            const rTop = row.offsetTop;
            const rBottom = rTop + row.offsetHeight;

            if (rTop < cTop) {
                container.scrollTop = rTop - 30;
            } else if (rBottom > cBottom) {
                container.scrollTop = rBottom - container.clientHeight + 30;
            }
        }
    },

    /* =========================================================================
     * KEYBOARD NAVIGATION & MC STYLE SELECTION
     * ========================================================================= */
    handleCommanderKey: function (e) {
        const panelKey = this.activePanel;
        const p = this.panels[panelKey];
        const total = p.filteredIndices.length;

        switch (e.key) {
            // TAB: Switch panels
            case 'Tab':
                e.preventDefault();
                this.switchActivePanel();
                break;

            // ARROW DOWN: Move down
            case 'ArrowDown':
                e.preventDefault();
                if (total > 0) {
                    p.focusedIndex = Math.min(p.focusedIndex + 1, total - 1);
                    this.renderPanelTable(panelKey);
                }
                break;

            // ARROW UP: Move up
            case 'ArrowUp':
                e.preventDefault();
                if (total > 0) {
                    p.focusedIndex = Math.max(p.focusedIndex - 1, 0);
                    this.renderPanelTable(panelKey);
                }
                break;

            // SPACEBAR & INSERT: Select item and jump to next item (MC style)
            case ' ':
            case 'Insert':
                e.preventDefault();
                if (total > 0) {
                    const rawIdx = p.filteredIndices[p.focusedIndex];
                    const item = p.items[rawIdx];

                    // Cannot select '..'
                    if (!item.is_up) {
                        this.toggleItemSelection(panelKey, rawIdx);
                    }

                    // Jump to next item
                    p.focusedIndex = Math.min(p.focusedIndex + 1, total - 1);
                    this.renderPanelTable(panelKey);
                }
                break;

            // ENTER: Navigate or view
            case 'Enter':
                e.preventDefault();
                if (total > 0) {
                    const rawIdx = p.filteredIndices[p.focusedIndex];
                    const item = p.items[rawIdx];
                    this.activateItem(panelKey, item);
                }
                break;

            // BACKSPACE: Go up directory
            case 'Backspace':
                e.preventDefault();
                if (p.path !== '') {
                    const parts = p.path.split('/');
                    parts.pop();
                    this.loadPanelPath(panelKey, parts.join('/'));
                }
                break;

            // ASTERISK or CTRL+A: Invert selection
            case '*':
                e.preventDefault();
                this.invertSelection(panelKey);
                break;

            // FUNCTION KEYS
            case 'F1':
                e.preventDefault();
                this.showHelp();
                break;
            case 'F3':
                e.preventDefault();
                this.actionView();
                break;
            case 'F4':
                e.preventDefault();
                this.actionEdit();
                break;
            case 'F5':
                e.preventDefault();
                if (e.altKey) {
                    this.actionCompressZip(this.activePanel);
                } else {
                    this.actionCopyBatch();
                }
                break;
            case 'F6':
                e.preventDefault();
                if (e.altKey) {
                    this.actionExtractZip(this.activePanel);
                } else {
                    this.actionMoveBatch();
                }
                break;
            case 'F7':
                e.preventDefault();
                this.actionNewFolder();
                break;
            case 'F8':
            case 'Delete':
                e.preventDefault();
                this.actionDeleteBatch();
                break;
            case 'F9':
                e.preventDefault();
                this.downloadCurrentFolder(this.activePanel);
                break;
            case 'c':
            case 'C':
                if (e.altKey) {
                    e.preventDefault();
                    this.actionCompressZip(this.activePanel);
                }
                break;
            case 'x':
            case 'X':
                if (e.altKey) {
                    e.preventDefault();
                    this.actionExtractZip(this.activePanel);
                }
                break;
        }
    },

    toggleItemSelection: function (panelKey, rawIndex) {
        const p = this.panels[panelKey];
        if (p.selectedIndices.has(rawIndex)) {
            p.selectedIndices.delete(rawIndex);
        } else {
            p.selectedIndices.add(rawIndex);
        }
        this.updatePanelSummary(panelKey);
    },

    selectAll: function (panelKey, select) {
        const p = this.panels[panelKey];
        p.selectedIndices.clear();
        if (select) {
            p.filteredIndices.forEach(function (idx) {
                if (!p.items[idx].is_up) {
                    p.selectedIndices.add(idx);
                }
            });
        }
        this.renderPanelTable(panelKey);
    },

    invertSelection: function (panelKey) {
        const p = this.panels[panelKey];
        p.filteredIndices.forEach(function (idx) {
            if (!p.items[idx].is_up) {
                if (p.selectedIndices.has(idx)) {
                    p.selectedIndices.delete(idx);
                } else {
                    p.selectedIndices.add(idx);
                }
            }
        });
        this.renderPanelTable(panelKey);
    },

    activateItem: function (panelKey, item) {
        if (item.is_dir) {
            this.loadPanelPath(panelKey, item.path);
        } else {
            const panel = this.panels[panelKey];
            this.openPreviewModal(panel.source, item.path, item.name, item.preview_type, item.size_h);
        }
    },

    getFocusedItem: function (panelKey) {
        const p = this.panels[panelKey];
        if (p.filteredIndices.length === 0) return null;
        const rawIdx = p.filteredIndices[p.focusedIndex];
        return p.items[rawIdx] || null;
    },

    getSelectedItems: function (panelKey) {
        const p = this.panels[panelKey];
        const selected = [];
        p.selectedIndices.forEach(function (rawIdx) {
            if (p.items[rawIdx] && !p.items[rawIdx].is_up) {
                selected.push(p.items[rawIdx]);
            }
        });

        // If none selected, fallback to the focused item (unless it's '..')
        if (selected.length === 0) {
            const focused = this.getFocusedItem(panelKey);
            if (focused && !focused.is_up) {
                selected.push(focused);
            }
        }

        return selected;
    },

    /* =========================================================================
     * COMMANDER ACTIONS (F1 - F9)
     * ========================================================================= */
    showHelp: function () {
        $('#modalShortcutsHelp').modal('show');
    },

    actionView: function () {
        const item = this.getFocusedItem(this.activePanel);
        if (!item || item.is_up) return;

        if (item.is_dir) {
            this.loadPanelPath(this.activePanel, item.path);
            return;
        }

        const panel = this.panels[this.activePanel];
        this.openPreviewModal(panel.source, item.path, item.name, item.preview_type, item.size_h);
    },

    actionEdit: function () {
        const item = this.getFocusedItem(this.activePanel);
        if (!item || item.is_up || item.is_dir) return;

        const panel = this.panels[this.activePanel];
        this.openEditorModal(panel.source, item.path, item.name);
    },

    actionCopyBatch: function () {
        const self = this;
        const srcPanelKey = self.activePanel;
        const dstPanelKey = (srcPanelKey === 'left') ? 'right' : 'left';
        const srcPanel = self.panels[srcPanelKey];
        const dstPanel = self.panels[dstPanelKey];

        const selected = self.getSelectedItems(srcPanelKey);
        if (selected.length === 0) {
            Swal.fire({ icon: 'info', title: 'Nada para copiar', text: 'Selecciona o enfoca un elemento para copiar.' });
            return;
        }

        const count = selected.length;
        const itemNames = selected.map(function (it) { return it.name; }).slice(0, 5).join(', ') + (count > 5 ? '...' : '');
        const targetDesc = dstPanel.source.toUpperCase() + ': /' + (dstPanel.path || '(raíz)');

        Swal.fire({
            title: '¿Copiar ' + count + ' elemento(s)?',
            html: '<p class="mb-2"><b>Elementos:</b> ' + escapeHtml(itemNames) + '</p>' +
                  '<p class="mb-0 text-primary"><b>Destino:</b> <code>' + escapeHtml(targetDesc) + '</code></p>',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#007bff',
            confirmButtonText: '<i class="fas fa-copy mr-1"></i> Sí, copiar [F5]',
            cancelButtonText: 'Cancelar'
        }).then(function (res) {
            if (res.isConfirmed) {
                Swal.fire({
                    title: 'Copiando...',
                    allowOutsideClick: false,
                    didOpen: function () { Swal.showLoading(); }
                });

                const paths = selected.map(function (it) { return it.path; });

                $.ajax({
                    url: '/files/api/files.php?action=copy_batch',
                    type: 'POST',
                    data: {
                        src_source: srcPanel.source,
                        dest_source: dstPanel.source,
                        dest_path: dstPanel.path,
                        items: paths
                    },
                    dataType: 'json',
                    success: function (resp) {
                        if (resp.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Copia completada',
                                text: resp.message,
                                timer: 1500,
                                showConfirmButton: false
                            });
                            self.loadPanelPath(dstPanelKey, dstPanel.path);
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error al copiar', text: resp.error || 'Ocurrió un error al copiar.' });
                        }
                    },
                    error: function () {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al contactar con el servidor' });
                    }
                });
            }
        });
    },

    actionMoveBatch: function () {
        const self = this;
        const srcPanelKey = self.activePanel;
        const dstPanelKey = (srcPanelKey === 'left') ? 'right' : 'left';
        const srcPanel = self.panels[srcPanelKey];
        const dstPanel = self.panels[dstPanelKey];

        const selected = self.getSelectedItems(srcPanelKey);
        if (selected.length === 0) {
            Swal.fire({ icon: 'info', title: 'Nada para mover', text: 'Selecciona o enfoca un elemento para mover.' });
            return;
        }

        const count = selected.length;
        const itemNames = selected.map(function (it) { return it.name; }).slice(0, 5).join(', ') + (count > 5 ? '...' : '');
        const targetDesc = dstPanel.source.toUpperCase() + ': /' + (dstPanel.path || '(raíz)');

        Swal.fire({
            title: '¿Mover ' + count + ' elemento(s)?',
            html: '<p class="mb-2"><b>Elementos:</b> ' + escapeHtml(itemNames) + '</p>' +
                  '<p class="mb-0 text-warning"><b>Destino:</b> <code>' + escapeHtml(targetDesc) + '</code></p>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ffc107',
            confirmButtonText: '<i class="fas fa-arrows-alt mr-1"></i> Sí, mover [F6]',
            cancelButtonText: 'Cancelar'
        }).then(function (res) {
            if (res.isConfirmed) {
                Swal.fire({
                    title: 'Moviendo...',
                    allowOutsideClick: false,
                    didOpen: function () { Swal.showLoading(); }
                });

                const paths = selected.map(function (it) { return it.path; });

                $.ajax({
                    url: '/files/api/files.php?action=move_batch',
                    type: 'POST',
                    data: {
                        src_source: srcPanel.source,
                        dest_source: dstPanel.source,
                        dest_path: dstPanel.path,
                        items: paths
                    },
                    dataType: 'json',
                    success: function (resp) {
                        if (resp.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Movimiento completado',
                                text: resp.message,
                                timer: 1500,
                                showConfirmButton: false
                            });
                            self.loadPanelPath(srcPanelKey, srcPanel.path);
                            self.loadPanelPath(dstPanelKey, dstPanel.path);
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error al mover', text: resp.error || 'Ocurrió un error al mover.' });
                        }
                    },
                    error: function () {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al contactar con el servidor' });
                    }
                });
            }
        });
    },

    actionDeleteBatch: function () {
        const self = this;
        const panelKey = self.activePanel;
        const panel = self.panels[panelKey];

        const selected = self.getSelectedItems(panelKey);
        if (selected.length === 0) {
            Swal.fire({ icon: 'info', title: 'Nada para borrar', text: 'Selecciona o enfoca un elemento para eliminar.' });
            return;
        }

        const count = selected.length;
        const itemNames = selected.map(function (it) { return it.name; }).slice(0, 5).join(', ') + (count > 5 ? '...' : '');

        Swal.fire({
            title: '¿Eliminar ' + count + ' elemento(s)?',
            html: '<p class="text-danger font-weight-bold">Esta acción no se puede deshacer.</p>' +
                  '<p><b>Elementos:</b> ' + escapeHtml(itemNames) + '</p>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: '<i class="fas fa-trash-alt mr-1"></i> Sí, eliminar [F8]',
            cancelButtonText: 'Cancelar'
        }).then(function (res) {
            if (res.isConfirmed) {
                Swal.fire({
                    title: 'Eliminando...',
                    allowOutsideClick: false,
                    didOpen: function () { Swal.showLoading(); }
                });

                const paths = selected.map(function (it) { return it.path; });

                $.ajax({
                    url: '/files/api/files.php?action=delete_batch',
                    type: 'POST',
                    data: {
                        source: panel.source,
                        items: paths
                    },
                    dataType: 'json',
                    success: function (resp) {
                        if (resp.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Eliminado',
                                text: resp.message,
                                timer: 1200,
                                showConfirmButton: false
                            });
                            self.loadPanelPath(panelKey, panel.path);
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error al eliminar', text: resp.error || 'Error al eliminar.' });
                        }
                    },
                    error: function () {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al contactar con el servidor' });
                    }
                });
            }
        });
    },

    actionNewFolder: function () {
        this.promptNewFolder(this.activePanel);
    },

    promptNewFolder: function (panelKey) {
        const self = this;
        const panel = self.panels[panelKey];

        Swal.fire({
            title: 'Nueva Carpeta [F7]',
            text: 'Ingresa el nombre para la nueva carpeta en ' + panel.source.toUpperCase() + ':/' + (panel.path || ''),
            input: 'text',
            inputPlaceholder: 'Nombre de la carpeta...',
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-check mr-1"></i> Crear',
            cancelButtonText: 'Cancelar',
            inputValidator: function (value) {
                if (!value || !value.trim()) {
                    return 'El nombre de la carpeta no puede estar vacío';
                }
            }
        }).then(function (res) {
            if (res.isConfirmed && res.value) {
                $.ajax({
                    url: '/files/api/files.php?action=mkdir',
                    type: 'POST',
                    data: {
                        source: panel.source,
                        path: panel.path,
                        name: res.value.trim()
                    },
                    dataType: 'json',
                    success: function (resp) {
                        if (resp.success) {
                            Swal.fire({ icon: 'success', title: 'Carpeta creada', timer: 1200, showConfirmButton: false });
                            self.loadPanelPath(panelKey, panel.path);
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error', text: resp.error });
                        }
                    },
                    error: function () {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al contactar con el servidor' });
                    }
                });
            }
        });
    },

    actionToggleSource: function () {
        const panelKey = this.activePanel;
        const currentSrc = this.panels[panelKey].source;
        const newSrc = (currentSrc === 'local') ? 'usb' : 'local';
        this.setPanelSource(panelKey, newSrc);
    },

    openUploadModal: function (panelKey) {
        this.uploadTargetPanel = panelKey;
        if (this.dropzoneInstance) {
            this.dropzoneInstance.removeAllFiles();
        }
        $('#modalUpload').modal('show');
    },

    refreshAll: function () {
        this.loadPanelPath('left', this.panels.left.path);
        this.loadPanelPath('right', this.panels.right.path);
    },

    /* =========================================================================
     * ZIP ARCHIVE OPERATIONS (COMPRESS / EXTRACT / DOWNLOAD FOLDER)
     * ========================================================================= */
    downloadCurrentFolder: function (panelKey) {
        panelKey = panelKey || this.activePanel;
        const panel = this.panels[panelKey];
        const folderDesc = panel.source.toUpperCase() + ':/' + (panel.path || '(raíz)');

        Swal.fire({
            title: '¿Descargar carpeta como .ZIP?',
            html: '<p>Se empaquetará y descargará todo el contenido de:<br><code>' + escapeHtml(folderDesc) + '</code></p>',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            confirmButtonText: '<i class="fas fa-file-archive mr-1"></i> Descargar .ZIP',
            cancelButtonText: 'Cancelar'
        }).then(function (res) {
            if (res.isConfirmed) {
                const downloadUrl = '/files/api/files.php?action=zip&source=' + encodeURIComponent(panel.source) + '&path=' + encodeURIComponent(panel.path);
                window.location.href = downloadUrl;
            }
        });
    },

    actionCompressZip: function (panelKey) {
        const self = this;
        panelKey = panelKey || self.activePanel;
        const panel = self.panels[panelKey];
        const selected = self.getSelectedItems(panelKey);

        if (selected.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Nada para comprimir',
                text: 'Selecciona con la Barra Espaciadora o enfoca los archivos/carpetas que deseas comprimir en .ZIP.'
            });
            return;
        }

        const count = selected.length;
        const itemNames = selected.map(function (it) { return it.name; }).slice(0, 5).join(', ') + (count > 5 ? '...' : '');

        let defaultZipName = '';
        if (count === 1) {
            defaultZipName = selected[0].name.replace(/\.[^/.]+$/, '') + '.zip';
        } else {
            const now = new Date();
            const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
            defaultZipName = 'comprimido_' + dateStr + '.zip';
        }

        Swal.fire({
            title: 'Comprimir en .ZIP [Alt+F5]',
            html: '<p class="mb-2"><b>Elementos seleccionados (' + count + '):</b><br><small class="text-muted">' + escapeHtml(itemNames) + '</small></p>' +
                  '<p class="mb-1 text-left"><b>Nombre del archivo .ZIP:</b></p>',
            input: 'text',
            inputValue: defaultZipName,
            inputPlaceholder: 'ejemplo.zip',
            showCancelButton: true,
            confirmButtonColor: '#ffc107',
            confirmButtonText: '<i class="fas fa-file-archive mr-1"></i> Comprimir ahora',
            cancelButtonText: 'Cancelar',
            inputValidator: function (val) {
                if (!val || !val.trim()) {
                    return 'Debes ingresar un nombre para el archivo ZIP.';
                }
            }
        }).then(function (res) {
            if (res.isConfirmed && res.value) {
                Swal.fire({
                    title: 'Creando archivo ZIP...',
                    html: 'Empaquetando ' + count + ' elemento(s)...',
                    allowOutsideClick: false,
                    didOpen: function () { Swal.showLoading(); }
                });

                const paths = selected.map(function (it) { return it.path; });

                $.ajax({
                    url: '/files/api/files.php?action=create_zip',
                    type: 'POST',
                    data: {
                        source: panel.source,
                        current_path: panel.path,
                        zip_name: res.value.trim(),
                        items: paths
                    },
                    dataType: 'json',
                    success: function (resp) {
                        if (resp.success) {
                            Swal.fire({
                                icon: 'success',
                                title: '¡Comprimido con éxito!',
                                text: resp.message,
                                timer: 2000,
                                showConfirmButton: false
                            });
                            self.loadPanelPath(panelKey, panel.path);
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error al comprimir', text: resp.error || 'Ocurrió un error inesperado.' });
                        }
                    },
                    error: function () {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Error de comunicación con el servidor al crear el ZIP.' });
                    }
                });
            }
        });
    },

    actionExtractZip: function (panelKey, specificZipPath) {
        const self = this;
        panelKey = panelKey || self.activePanel;
        const panel = self.panels[panelKey];
        const dstPanelKey = (panelKey === 'left') ? 'right' : 'left';
        const dstPanel = self.panels[dstPanelKey];

        let targetZipPath = specificZipPath || null;
        let targetZipName = '';

        if (!targetZipPath) {
            const selected = self.getSelectedItems(panelKey);
            for (let i = 0; i < selected.length; i++) {
                if (selected[i].name.toLowerCase().endsWith('.zip')) {
                    targetZipPath = selected[i].path;
                    targetZipName = selected[i].name;
                    break;
                }
            }

            if (!targetZipPath) {
                const focused = self.getFocusedItem(panelKey);
                if (focused && focused.name.toLowerCase().endsWith('.zip')) {
                    targetZipPath = focused.path;
                    targetZipName = focused.name;
                }
            }
        } else {
            targetZipName = targetZipPath.split('/').pop();
        }

        if (!targetZipPath) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecciona un archivo .ZIP',
                text: 'Por favor, enfoca o selecciona un archivo con extensión .ZIP para poder descomprimirlo.'
            });
            return;
        }

        const currentDesc = panel.source.toUpperCase() + ':/' + (panel.path || '(raíz actual)');
        const oppositeDesc = dstPanel.source.toUpperCase() + ':/' + (dstPanel.path || '(raíz opuesta)');
        const subfolderName = targetZipName.replace(/\.zip$/i, '');

        Swal.fire({
            title: 'Descomprimir .ZIP [Alt+F6]',
            html: '<p class="mb-2"><b>Archivo a descomprimir:</b> <code>' + escapeHtml(targetZipName) + '</code></p>' +
                  '<p class="mb-2 text-left"><b>¿Dónde deseas extraer el contenido?</b></p>',
            input: 'radio',
            inputOptions: {
                'current': 'En este panel (' + escapeHtml(currentDesc) + ')',
                'subfolder': 'En una nueva carpeta "' + escapeHtml(subfolderName) + '"',
                'opposite': 'En el panel opuesto (' + escapeHtml(oppositeDesc) + ')'
            },
            inputValue: 'current',
            showCancelButton: true,
            confirmButtonColor: '#17a2b8',
            confirmButtonText: '<i class="fas fa-box-open mr-1"></i> Extraer aquí',
            cancelButtonText: 'Cancelar'
        }).then(function (res) {
            if (res.isConfirmed && res.value) {
                let targetDestSource = panel.source;
                let targetDestPath = panel.path;

                if (res.value === 'opposite') {
                    targetDestSource = dstPanel.source;
                    targetDestPath = dstPanel.path;
                } else if (res.value === 'subfolder') {
                    targetDestSource = panel.source;
                    targetDestPath = (panel.path ? panel.path + '/' : '') + subfolderName;
                }

                Swal.fire({
                    title: 'Descomprimiendo...',
                    text: 'Extrayendo contenido de ' + targetZipName + '...',
                    allowOutsideClick: false,
                    didOpen: function () { Swal.showLoading(); }
                });

                $.ajax({
                    url: '/files/api/files.php?action=extract_zip',
                    type: 'POST',
                    data: {
                        source: panel.source,
                        zip_path: targetZipPath,
                        dest_source: targetDestSource,
                        dest_path: targetDestPath
                    },
                    dataType: 'json',
                    success: function (resp) {
                        if (resp.success) {
                            Swal.fire({
                                icon: 'success',
                                title: '¡Extracción completada!',
                                text: resp.message,
                                timer: 2000,
                                showConfirmButton: false
                            });
                            self.loadPanelPath('left', self.panels.left.path);
                            self.loadPanelPath('right', self.panels.right.path);
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error al extraer', text: resp.error || 'Ocurrió un error al extraer el archivo ZIP.' });
                        }
                    },
                    error: function () {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Error de comunicación con el servidor al extraer el archivo.' });
                    }
                });
            }
        });
    },

    /* =========================================================================
     * F4 EDITOR MODAL & SAVE
     * ========================================================================= */
    openEditorModal: function (source, path, filename) {
        const self = this;
        $('#txtEditorSource').val(source);
        $('#txtEditorPath').val(path);
        $('#lblEditorFilename').text(filename + ' (' + source.toUpperCase() + ')');
        $('#txtEditorContent').val('Cargando contenido...');
        $('#modalEditor').modal('show');

        $.ajax({
            url: '/files/api/files.php?action=read_edit',
            type: 'GET',
            data: { source: source, path: path },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    $('#txtEditorContent').val(res.content);
                    $('#lblEditorStats').text(res.size_h + ' | ' + (res.ext ? res.ext.toUpperCase() : 'TXT'));
                    self.updateEditorStats();
                    setTimeout(function () {
                        $('#txtEditorContent').focus();
                    }, 400);
                } else {
                    $('#modalEditor').modal('hide');
                    Swal.fire({ icon: 'error', title: 'Error al abrir', text: res.error });
                }
            },
            error: function () {
                $('#modalEditor').modal('hide');
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al leer el archivo' });
            }
        });
    },

    updateEditorStats: function () {
        const textarea = document.getElementById('txtEditorContent');
        if (!textarea) return;

        const val = textarea.value;
        const selStart = textarea.selectionStart;
        const lines = val.substr(0, selStart).split('\n');
        const lineNum = lines.length;
        const colNum = lines[lines.length - 1].length + 1;
        const totalLines = val.split('\n').length;

        $('#lblEditorCursor').text('Línea ' + lineNum + ' de ' + totalLines + ', Columna ' + colNum + ' | [Ctrl+S] para guardar');
    },

    saveEditorContent: function () {
        const self = this;
        const source = $('#txtEditorSource').val();
        const path = $('#txtEditorPath').val();
        const content = $('#txtEditorContent').val();
        const $btn = $('#btnSaveEditor');

        $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...');

        $.ajax({
            url: '/files/api/files.php?action=save_edit',
            type: 'POST',
            data: {
                source: source,
                path: path,
                content: content
            },
            dataType: 'json',
            success: function (res) {
                $btn.prop('disabled', false).html('<i class="fas fa-save mr-1"></i> Guardar [F2 / Ctrl+S]');
                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Guardado',
                        text: res.message || 'Archivo guardado con éxito',
                        timer: 1200,
                        showConfirmButton: false
                    });
                    self.loadPanelPath(self.activePanel, self.panels[self.activePanel].path);
                } else {
                    Swal.fire({ icon: 'error', title: 'Error al guardar', text: res.error });
                }
            },
            error: function () {
                $btn.prop('disabled', false).html('<i class="fas fa-save mr-1"></i> Guardar [F2 / Ctrl+S]');
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al contactar con el servidor' });
            }
        });
    },

    /* =========================================================================
     * F3 PREVIEW MODAL
     * ========================================================================= */
    openPreviewModal: function (source, path, name, type, sizeStr) {
        $('#lblPreviewTitle').html('<i class="fas fa-eye mr-2"></i> ' + escapeHtml(name));
        $('#lblPreviewSize').text('Tamaño: ' + sizeStr + ' (' + source.toUpperCase() + ')');
        $('#btnDownloadFromPreview').attr('href', '/files/api/files.php?action=download&source=' + encodeURIComponent(source) + '&path=' + encodeURIComponent(path));

        const $container = $('#previewContainer');
        $container.html('<div class="py-5"><i class="fas fa-spinner fa-spin fa-3x text-primary"></i><p class="mt-2 text-muted">Cargando previsualización...</p></div>');
        $('#modalPreview').modal('show');

        const previewUrl = '/files/api/files.php?action=preview&source=' + encodeURIComponent(source) + '&path=' + encodeURIComponent(path);

        if (type === 'image') {
            $container.html('<img src="' + previewUrl + '" class="img-fluid rounded shadow-sm" style="max-height: 65vh;">');
        } else if (type === 'pdf') {
            $container.html('<iframe src="' + previewUrl + '" style="width: 100%; height: 65vh; border: none;" class="rounded shadow-sm"></iframe>');
        } else if (type === 'video') {
            $container.html('<video controls autoplay class="w-100 rounded shadow-sm" style="max-height: 65vh;"><source src="' + previewUrl + '">Tu navegador no soporta video.</video>');
        } else if (type === 'audio') {
            $container.html('<div class="py-5"><i class="fas fa-music fa-4x text-info mb-3"></i><br><audio controls class="w-75"><source src="' + previewUrl + '">Tu navegador no soporta audio.</audio></div>');
        } else if (type === 'text') {
            $.getJSON(previewUrl, function (res) {
                if (res.success) {
                    $container.html('<pre class="preview-text">' + escapeHtml(res.content) + '</pre>');
                } else {
                    $container.html('<div class="alert alert-danger">Error: ' + escapeHtml(res.error) + '</div>');
                }
            }).fail(function () {
                $container.html('<div class="alert alert-danger">Error al cargar texto.</div>');
            });
        } else if (type === 'zip') {
            $.getJSON(previewUrl, function (res) {
                if (res.success) {
                    let filesTable = '<div class="table-responsive text-left border rounded" style="max-height: 52vh; overflow-y: auto;">' +
                        '<table class="table table-sm table-striped table-hover mb-0">' +
                        '<thead class="thead-light"><tr><th>Archivo / Carpeta</th><th class="text-right">Tamaño</th><th class="text-right">Comprimido</th><th class="text-right">Fecha</th></tr></thead><tbody>';

                    if (res.files && res.files.length > 0) {
                        res.files.forEach(function (f) {
                            const icon = f.is_dir ? '<i class="fas fa-folder text-warning mr-1"></i>' : '<i class="fas fa-file text-secondary mr-1"></i>';
                            filesTable += '<tr>' +
                                '<td>' + icon + '<code>' + escapeHtml(f.name) + '</code></td>' +
                                '<td class="text-right small">' + escapeHtml(f.size_h) + '</td>' +
                                '<td class="text-right small text-muted">' + escapeHtml(f.compressed_size_h) + '</td>' +
                                '<td class="text-right small text-muted">' + escapeHtml(f.modified) + '</td>' +
                                '</tr>';
                        });
                    } else {
                        filesTable += '<tr><td colspan="4" class="text-center text-muted py-3">El archivo ZIP está vacío.</td></tr>';
                    }
                    filesTable += '</tbody></table></div>';

                    const actionButtons = '<div class="mt-3 text-right">' +
                        '<button type="button" class="btn btn-info btn-sm mr-2" onclick="$(\'#modalPreview\').modal(\'hide\'); app.actionExtractZip(app.activePanel, \'' + escapeHtml(path) + '\')">' +
                        '<i class="fas fa-box-open mr-1"></i> Descomprimir este ZIP' +
                        '</button>' +
                        '</div>';

                    $container.html('<div class="alert alert-info py-2 text-left mb-2 d-flex justify-content-between align-items-center">' +
                        '<div><i class="fas fa-archive mr-2"></i><b>Contenido del archivo ZIP</b> (' + res.total_files + ' elementos)</div>' +
                        '</div>' + filesTable + actionButtons);
                } else {
                    $container.html('<div class="alert alert-danger">Error: ' + escapeHtml(res.error) + '</div>');
                }
            }).fail(function () {
                $container.html('<div class="alert alert-danger">Error al cargar contenido del archivo ZIP.</div>');
            });
        } else {
            $container.html('<div class="py-4 text-muted"><i class="fas fa-file fa-4x mb-2"></i><p>Formato sin visor integrado. Usa el botón Descargar.</p></div>');
        }
    },

    /* =========================================================================
     * USB DEVICES MANAGEMENT VIEW
     * ========================================================================= */
    initUsbView: function () {
        const self = this;
        $('#btnRefreshUsb').on('click', function () { self.loadUsbDevices(); });
        self.loadUsbDevices();
    },

    loadUsbDevices: function () {
        const self = this;
        const $tbody = $('#tblUsbDevices tbody');
        $tbody.html('<tr><td colspan="7" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin mr-2"></i> Escaneando dispositivos de almacenamiento...</td></tr>');

        $.getJSON('/files/api/usb.php?action=devices', function (res) {
            $tbody.empty();
            if (!res.success) {
                $tbody.html('<tr><td colspan="7" class="text-center py-3 text-danger">' + escapeHtml(res.error) + '</td></tr>');
                return;
            }

            if (!res.devices || res.devices.length === 0) {
                $tbody.html('<tr><td colspan="7" class="text-center py-4 text-muted"><i class="fas fa-info-circle mr-1"></i> No se detectaron unidades extraíbles.</td></tr>');
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
                        '<a href="/files/" class="btn btn-outline-primary btn-sm"><i class="fas fa-columns mr-1"></i> Abrir en Commander</a>' +
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
                    '<td>' + (dev.label ? '<span class="badge badge-light border">' + escapeHtml(dev.label) + '</span>' : '<span class="text-muted">-</span>') + '</td>' +
                    '<td>' + escapeHtml(dev.model || '-') + '</td>' +
                    '<td><span class="badge badge-secondary">' + escapeHtml(dev.fstype || 'desconocido') + '</span></td>' +
                    '<td><strong>' + escapeHtml(dev.size) + '</strong></td>' +
                    '<td><span class="badge ' + badgeClass + '">' + statusText + '</span></td>' +
                    '<td class="text-right">' + actionBtn + '</td>' +
                    '</tr>';

                $tbody.append(row);
            });
        }).fail(function () {
            $tbody.html('<tr><td colspan="7" class="text-center py-3 text-danger">Error al conectar con el servicio USB.</td></tr>');
        });
    },

    mountUsb: function (devicePath) {
        Swal.fire({
            title: 'Montando unidad...',
            text: 'Espere mientras se monta ' + devicePath + ' en /media/usb',
            allowOutsideClick: false,
            didOpen: function () { Swal.showLoading(); }
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
                        confirmButtonText: 'Ir al Gestor Commander'
                    }).then(function () {
                        window.location.href = '/files/';
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
        Swal.fire({
            title: '¿Desmontar unidad USB?',
            text: 'Asegúrate de que no haya transferencias de archivos en curso.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, desmontar',
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
        $('#btnRefreshShares').on('click', function () { self.loadShares(); });
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
                Swal.fire({ icon: 'success', title: 'Copiado', timer: 1000, showConfirmButton: false });
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
                            Swal.fire({ icon: 'success', title: 'Revocado', timer: 1200, showConfirmButton: false });
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
    },

    formatBytes: function (bytes, precision) {
        precision = precision || 2;
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        bytes = Math.max(bytes, 0);
        let pow = Math.floor((bytes ? Math.log(bytes) : 0) / Math.log(1024));
        pow = Math.min(pow, units.length - 1);
        bytes /= Math.pow(1024, pow);
        return bytes.toFixed(precision) + ' ' + units[pow];
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
