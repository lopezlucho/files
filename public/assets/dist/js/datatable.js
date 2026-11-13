$(function () {

    var depto;
    var desde;
    var hasta;
    var tituloprn;
    if (document.getElementById("depto")) {
        depto = document.getElementById("depto").value;
    } else {
        depto = '';
    }
    if (document.getElementById("desde")) {
        desde = document.getElementById("desde").value;
    } else {
        desde = '';
    }
    if (document.getElementById("hasta")) {
        hasta = document.getElementById("hasta").value;
    } else {
        hasta = '';
    }
    if (document.getElementById("titulo")) {
        tituloprn = document.getElementById("titulo").value;
    } else {
        tituloprn = '';
    }
    const cabecera = '<div class="row"><div class="row"><div align="left" style="float:left" class="col-lg-3 col-3"><h3 class="bodyText" style="text-align:center;"></br>Industrialización Estañifera Boliviana S.R.L.</br>Oruro - Bolivia</h3></div><div class="col-lg-6 col-6">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div></div></div>';
    var titulo;
    if (depto=='') {
        titulo = '<h1 class="pageName" align="center">' + tituloprn + '</h1><h3 class="subHeader" align="center">Razon Social: Industrializacion Estañifera Boliviana S. R. L.</h3><h3 class="subHeader" align="center">del ' + desde + ' al ' + hasta + '</h3>';
    } else {
        titulo = '<h1 class="pageName" align="center">' + tituloprn + '</h1><h3 class="subHeader" align="center">Razon Social: Industrializacion Estañifera Boliviana S. R. L.</h3><h3 class="subHeader" align="center">Departamento : ' + depto + '</h3><h3 class="subHeader" align="center">del ' + desde + ' al ' + hasta + '</h3>';
    }
    // --- Títulos para los reportes (usado en Print y PDF) ---
    const reportTitle = $('.content-wrapper h1.pageName').text() || 'Industrializacion Estañifera Boliviana S. R. L. - IEB';
    const reportSubtitle = $('.content-wrapper h2.sidebarHeader').text() || tituloprn;
    const reportPeriod = $('.content-wrapper h3.smallText').first().text() || '';

    const buttons = [
                        {
                        	extend:    'copyHtml5',
                        	text:      '<i class="fas fa-copy"></i> ',
                        	titleAttr: 'Copiar al Portapapeles',
                        	className: 'btn btn-primary'
                        },
                        {
                        	extend:    'csvHtml5',
                        	text:      '<i class="fas fa-file-csv"></i> ',
                        	titleAttr: 'Exportar a CSV',
                        	className: 'btn btn-success'
                        },
                        {
                        	extend:    'excelHtml5',
                        	text:      '<i class="fas fa-file-excel"></i> ',
                        	titleAttr: 'Exportar a Excel',
                        	className: 'btn btn-success'
                        },
                        {
                        	extend:    'pdfHtml5',
                        	text:      '<i class="fas fa-file-pdf"></i> ',
                        	titleAttr: 'Exportar a PDF',
                        	className: 'btn btn-danger',
                            exportOptions: {
                                modifier: {
                                    selected: true
                                },
                                columns: ':visible'
                            }
                        },
                        {
                        	extend:    'print',
                        	text:      '<i class="fa fa-print"></i> ',
                        	titleAttr: 'Imprimir',
                        	className: 'btn btn-info',
                            footer: true,
                            exportOptions: {
                                modifier: {
                                    selected: true
                                },
                                columns: ':visible'
                            }
                        },
                        {
                        	extend:    'colvis',
                        	text:      '<i class="fa-solid fa-table-columns"></i> ',
                        	titleAttr: 'Visibilidad',
                        	className: 'btn btn-warning'
                        },
                        {
                        	extend:    'pageLength',
                        	text:      '<i class="fa-solid fa-table-list"></i> ',
                        	titleAttr: 'Mostrar Filas',
                        	className: 'btn btn-primary'
                        },
                    ];
    const buttons2 = [
                        {
                        	extend:    'copyHtml5',
                        	text:      '<i class="fas fa-copy"></i> ',
                        	titleAttr: 'Copiar al Portapapeles',
                        	className: 'btn btn-primary'
                        },
                        {
                        	extend:    'csvHtml5',
                        	text:      '<i class="fas fa-file-csv"></i> ',
                        	titleAttr: 'Exportar a CSV',
                        	className: 'btn btn-success'
                        },
                        {
                        	extend:    'excelHtml5',
                        	text:      '<i class="fas fa-file-excel"></i> ',
                        	titleAttr: 'Exportar a Excel',
                        	className: 'btn btn-success'
                        },
                        {
                        	extend:    'pdfHtml5',
                        	text:      '<i class="fas fa-file-pdf"></i> ',
                        	titleAttr: 'Exportar a PDF',
                        	className: 'btn btn-danger',
                        	orientation: 'landscape',
                        	pageSize: 'LETTER',
                        },
                        {
                        	extend:    'print',
                        	text:      '<i class="fa fa-print"></i> ',
                        	titleAttr: 'Imprimir',
                        	className: 'btn btn-info',
                        	title: cabecera,
                        	messageTop: titulo,
                        	footer: true,
                        	customize: function(win) {
                                var last = null;
                                var current = null;
                                var body = [];
                        
                                var css = '@page { size: landscape; }',
                                    head = win.document.head || win.document.getElementsByTagName('head')[0],
                                    style = win.document.createElement('style');
                        
                                style.type = 'text/css';
                                style.media = 'print';
                        
                                if (style.styleSheet)
                                {
                                  style.styleSheet.cssText = css;
                                }
                                else
                                {
                                  style.appendChild(win.document.createTextNode(css));
                                }
                        
                                head.appendChild(style);
                                $(win.document.body)
                                .prepend('<img src="dist/img/logo_nuevo.png" width="180" style="position:absolute; top:0; right:0;" />');
                            }
                        },
                        {
                        	extend:    'colvis',
                        	text:      '<i class="fa-solid fa-table-columns"></i> ',
                        	titleAttr: 'Visibilidad',
                        	className: 'btn btn-warning'
                        },
                        {
                        	extend:    'pageLength',
                        	text:      '<i class="fa-solid fa-table-list"></i> ',
                        	titleAttr: 'Mostrar Filas',
                        	className: 'btn btn-primary'
                        },
                    ];
    const buttons3 = [
                        {
                        	extend:    'copyHtml5',
                        	text:      '<i class="fas fa-copy"></i> ',
                        	titleAttr: 'Copiar al Portapapeles',
                        	className: 'btn btn-primary'
                        },
                        {
                        	extend:    'csvHtml5',
                        	text:      '<i class="fas fa-file-csv"></i> ',
                        	titleAttr: 'Exportar a CSV',
                        	className: 'btn btn-success'
                        },
                        {
                        	extend:    'excelHtml5',
                        	text:      '<i class="fas fa-file-excel"></i> ',
                        	titleAttr: 'Exportar a Excel',
                        	className: 'btn btn-success'
                        },
                        {
                        	extend:    'pdfHtml5',
                        	text:      '<i class="fas fa-file-pdf"></i> ',
                        	titleAttr: 'Exportar a PDF',
                        	className: 'btn btn-danger',
                        	title:      '',
                        	pageSize: 'LETTER',
                        },
                        {
                        	extend:    'print',
                        	text:      '<i class="fa fa-print"></i> ',
                        	titleAttr: 'Imprimir',
                        	className: 'btn btn-info',
                        	title:      '',
                        	autoPrint: true,
                            orientation: '',
                            pageSize: 'letter',
                            fontSize: '50',
                        	footer: false,

                        },
                        {
                        	extend:    'colvis',
                        	text:      '<i class="fa-solid fa-table-columns"></i> ',
                        	titleAttr: 'Visibilidad',
                        	className: 'btn btn-warning'
                        },
                        {
                        	extend:    'pageLength',
                        	text:      '<i class="fa-solid fa-table-list"></i> ',
                        	titleAttr: 'Mostrar Filas',
                        	className: 'btn btn-primary'
                        },
                    ];
    const buttons_compras = [
        { extend: 'copyHtml5', text: '<i class="fas fa-copy"></i> ', titleAttr: 'Copiar', className: 'btn btn-primary' },
        { extend: 'csvHtml5', text: '<i class="fas fa-file-csv"></i> ', titleAttr: 'CSV', className: 'btn btn-success' },
        { extend: 'excelHtml5', text: '<i class="fas fa-file-excel"></i> ', titleAttr: 'Excel', className: 'btn btn-success' },
        {
            extend: 'pdfHtml5',
            text: '<i class="fas fa-file-pdf"></i> ',
            titleAttr: 'Exportar a PDF',
            className: 'btn btn-danger',
            orientation: 'landscape', // Horizontal
            pageSize: 'LEGAL', // Tamaño Oficio/Legal
            title: reportSubtitle, // Título principal del PDF
            messageTop: reportPeriod, // Subtítulo con el periodo
            customize: function (doc) {
                // Estilos generales del documento
                doc.defaultStyle.fontSize = 8;
                doc.styles.tableHeader = { bold: true, fontSize: 9, fillColor: '#343a40', color: 'white' };
                doc.styles.title = { fontSize: 16, bold: true, alignment: 'center' };
                doc.styles.message = { fontSize: 12, alignment: 'center' };
                doc.footer = function(currentPage, pageCount) { 
                    return { text: currentPage.toString() + ' de ' + pageCount, alignment: 'center' }; 
                };
            }
        },
        {
            extend: 'print',
            text: '<i class="fa fa-print"></i> ',
            titleAttr: 'Imprimir',
            className: 'btn btn-info',
            title: ' ', // Eliminar título por defecto
            customize: function(win) {
                // --- Injected CSS for Print ---
                let css = '@page { size: legal landscape; margin: 0.5in; } ' +
                          'body { font-size: 9pt; } ' +
                          'table { width: 100%; border-collapse: collapse; } ' +
                          'th, td { border: 1px solid #ccc !important; padding: 4px; } ' + // Añade bordes a todas las celdas
                          '.col-nombre { white-space: nowrap !important; }'; // Evita el salto de línea en la columna Nombre
                
                let head = win.document.head || win.document.getElementsByTagName('head')[0];
                let style = win.document.createElement('style');
                style.type = 'text/css';
                style.media = 'print';
                style.appendChild(win.document.createTextNode(css));
                head.appendChild(style);

                // --- Custom Header ---
                $(win.document.body).find('h1').remove();
                $(win.document.body).prepend(
                    '<div style="text-align:center; margin-bottom:20px;">' +
                        '<h1>' + reportTitle + '</h1>' +
                        '<h3>' + reportSubtitle + '</h3>' +
                        '<h4>' + reportPeriod + '</h4>' +
                    '</div>'
                );
 
                $(win.document.body).find('table').addClass('compact').css('font-size', 'inherit');
            }
        },
        { extend: 'colvis', text: '<i class="fa-solid fa-table-columns"></i> ', titleAttr: 'Visibilidad', className: 'btn btn-warning' },
        { extend: 'pageLength', text: '<i class="fa-solid fa-table-list"></i> ', titleAttr: 'Mostrar Filas', className: 'btn btn-primary' },
    ];

    $("#example1").DataTable({
      "responsive": true, "lengthChange": false, "autoWidth": false,
      "buttons": ["copy", "csv", "excel", "pdf", "print", "colvis"]
    }).buttons().container().appendTo('#example1_wrapper .col-md-6:eq(0)');
    $('#analisis_pendientes').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": 10,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "ordering": true,
    "info": true,
    "autoWidth": false,
    "responsive": true,
    });
    $('#tabla_precios').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons3,
    "select": true,
    "pageLength": -1,
    "paging": false,
    "lengthChange": false,
    "searching": false,
    "ordering": false,
    "info": false,
    "autoWidth": false,
    "responsive": true,
    "scrollY": 280,
    });
    $('#tabla_alta').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "info": true,
    "autoWidth": false,
    "responsive": true,
    "ordering":true,
    "order": [
       [7, "desc"]
    ],
    });
    $('#tabla_media').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "info": true,
    "autoWidth": false,
    "responsive": true,
    "ordering":true,
    "order": [
       [7, "desc"]
    ],
    });
    $('#tabla_baja').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "info": true,
    "autoWidth": false,
    "responsive": true,
    "ordering":true,
    "order": [
       [6, "asc"]
    ],
    });
    $('#tabla_retenciones').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons2,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "info": true,
    "autoWidth": true,
    "responsive": false,
    "ordering":true,
    "order": [
       [1, "asc"]
    ],
    });
    const buttons_librocompras = [
                        {
                        	extend:    'copyHtml5',
                        	text:      '<i class="fas fa-copy"></i> ',
                        	titleAttr: 'Copiar al Portapapeles',
                        	className: 'btn btn-primary'
                        },
                        {
                        	extend:    'csvHtml5',
                        	text:      '<i class="fas fa-file-csv"></i> ',
                        	titleAttr: 'Exportar a CSV',
                        	className: 'btn btn-success'
                        },
                        {
                        	extend:    'excelHtml5',
                        	text:      '<i class="fas fa-file-excel"></i> ',
                        	titleAttr: 'Exportar a Excel',
                        	className: 'btn btn-success'
                        },
                        {
                        	extend:    'pdfHtml5',
                        	text:      '<i class="fas fa-file-pdf"></i> ',
                        	titleAttr: 'Exportar a PDF',
                        	className: 'btn btn-danger',
                        	orientation: 'landscape',
                        	pageSize: 'LETTER',
                        },
                        {
                        	extend:    'print',
                        	text:      '<i class="fa fa-print"></i> ',
                        	titleAttr: 'Imprimir',
                        	className: 'btn btn-info',
                        	title: cabecera,
                        	messageTop: titulo,
                        	footer: true,
                        	customize: function(win) {
                                var last = null;
                                var current = null;
                                var body = [];
                        
                                var css = '@page { size: landscape; } table td { white-space: nowrap !important; } table th { white-space: normal !important; text-align: center !important; vertical-align: middle !important; } .text-end { text-align: right !important; } table td:not(.text-end):not(.text-center) { text-align: left !important; }',
                                    head = win.document.head || win.document.getElementsByTagName('head')[0],
                                    style = win.document.createElement('style');
                        
                                style.type = 'text/css';
                                style.media = 'print';
                        
                                if (style.styleSheet)
                                {
                                  style.styleSheet.cssText = css;
                                }
                                else
                                {
                                  style.appendChild(win.document.createTextNode(css));
                                }
                        
                                head.appendChild(style);
                                $(win.document.body)
                                .prepend('<img src="dist/img/logo_nuevo.png" width="180" style="position:absolute; top:0; right:0;" />');
                            }
                        },
                        {
                        	extend:    'colvis',
                        	text:      '<i class="fa-solid fa-table-columns"></i> ',
                        	titleAttr: 'Visibilidad',
                        	className: 'btn btn-warning'
                        },
                        {
                        	extend:    'pageLength',
                        	text:      '<i class="fa-solid fa-table-list"></i> ',
                        	titleAttr: 'Mostrar Filas',
                        	className: 'btn btn-primary'
                        },
                    ];
    $('#tabla_librocompras').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons_librocompras,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "info": true,
    "autoWidth": true,
    "responsive": false,
    "ordering": true,
    "columnDefs": [
        { "className": "text-end", "targets": [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] }
    ],
    "order": [
       [2, "asc"],
       [1, "asc"],
       [0, "asc"],
       [3, "asc"]
    ],
    });
    $('#tabla_libroventas').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons2,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": false,
    "lengthChange": false,
    "searching": false,
    "info": true,
    "autoWidth": false,
    "responsive": false,
    "columnDefs": [
        { "width": "70px", "targets": [ 4 ] },
        { "width": "125px", "targets": [ 8 ] },
        { "width": "600px", "targets": '_all' },
        { "className": "dt-wrap", "targets": [ 4, 5 ] },
        { "className": "dt-nowrap", "targets": [ 6, 7 ] },
        { "className": 'dt-left', "targets": [ 0, 1, 2, 3, 4, 5, 6, 7, 8] },
        { "className": 'dt-right', "targets": [ 9, 10, 11, 12, 13, 14, 15, 16, 17 ] },
        { "className": 'dt-center', "targets": [ 18 ] },
    ],
    "columns": [
        { "type": "num" },
        { "type": "num" },
        { "type": "num" },
        null,
        null,
        null,
        null,
        null,
        null,
        { "type": "num" },
        { "type": "num" },
        { "type": "num" },
        { "type": "num" },
        { "type": "num" },
        { "type": "num" },
        { "type": "num" },
        { "type": "num" },
        { "type": "num" },
        null,
        null
    ],
    "ordering":true,
    "order": [
       [2, "asc"]
    ],
    });
    $('#tabla_recepciones').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "scrollCollapse": true,
    "scrollY": "40vh",
    "scrollX": true,
    "info": true,
    "autoWidth": false,
    "responsive": false,
    "fixedHeader": {
            "header": true,
            "footer": true
        },
    "ordering":true,
    "order": [
       [1, "desc"]
    ],
    });
    $('#tabla_ventas_recep').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": false,
    "lengthChange": true,
    "searching": true,
    "scrollCollapse": true,
    "scrollY": "40vh",
    "scrollX": true,
    "info": true,
    "autoWidth": false,
    "responsive": false,
    "fixedHeader": {
            "header": true,
            "footer": true
        },
    /*"columns": [
        { "type": "num" },
        { "type": "string" },
        { "type": "date" },
        { "type": "num" },
        { "type": "num-fmt" },
        { "type": "num" },
        { "type": "string" },
        { "type": "num" },
        { "type": "num" },
        { "type": "num-fmt" },
        { "type": "num-fmt" },
        { "type": "html" }
    ],*/
    "columns": [
        { "type": "num" },
        { "type": "string" },
        { "type": "string" },
        { "type": "string" },
        null,
        null,
        { "type": "string" },
        null,
        null,
        null,
        null,
        { "type": "html" }
    ],
    "ordering":false,
    "order": [
       [0, "desc"],
       [2, "desc"],
       [1, "desc"],
    ],
    });
    $('#tabla_detalle_compras').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
        dom: 'Bfrtip',
        buttons: buttons_compras, // Usamos la nueva configuración de botones
        select: true,
        "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
        "pageLength": -1,
        "paging": false,
        "lengthChange": true,
        "searching": true,
        "scrollCollapse": true,
        "scrollY": "40vh",
        "scrollX": true,
        "info": true,
        "autoWidth": false,
        "responsive": false,
        "fixedHeader": {
            "header": true,
            "footer": true
        },
        "ordering":false,
        "order": [
           [0, "desc"]
        ],
    });
    $('#tabla_comprobantes').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": false,
    "lengthChange": true,
    "searching": true,
    "info": true,
    "autoWidth": false,
    "responsive": false,
    "fixedHeader": {
            "header": true,
            "footer": true
        },
    "columns": [
        { "type": "num" },
        { "type": "num" },
        { "type": "date" },
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ],
    "ordering":true,
    "order": [
       [0, "asc"],
       [1, "asc"],
       [10, "asc"]
    ],
    });
    $('#tabla_m02').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": false,
    "lengthChange": true,
    "searching": true,
    "info": false,
    "autoWidth": false,
    "responsive": false,
    "ordering":true,
    });
    $('#tabla_certificados').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "scrollY": 200,
    "scrollX": true,
    "info": true,
    "autoWidth": false,
    "responsive": false,
    "fixedHeader": {
            "header": true,
            "footer": true
        },
    "ordering":true,
    });
    $('#tabla_cotiz').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "info": true,
    "autoWidth": false,
    "responsive": false,
    "fixedHeader": {
            "header": true,
            "footer": true
        },
    "ordering":true,
    "order": [
       [0, "desc"]
    ],
    });
    $('#tabla_m02_consolidado').DataTable({
        "responsive": false,
        "lengthChange": false,
        "autoWidth": false,
        "paging": false,
        "searching": false,
        "info": false,
        "ordering": false,
        "columnDefs": [
          { "className": "text-end", "targets": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] }
        ]
      });
    $('#tabla_generica').DataTable({
        "language": {
            "url": "dist/js/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: buttons,
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": false,
    "lengthChange": true,
    "searching": true,
    "scrollCollapse": true,
    "scrollY": "50vh",
    "scrollX": true,
    "info": true,
    "autoWidth": false,
    "responsive": false,
    "fixedHeader": {
            "header": true,
            "footer": true
        },
    "ordering":true,
    });
});
$(document).ready(function() {
    var selected = [];
 
    $("#select").DataTable({
        "processing": true,
        "serverSide": true,
        "ajax": "scripts/ids-arrays.php",
        "rowCallback": function( row, data ) {
            if ( $.inArray(data.DT_RowId, selected) !== -1 ) {
                $(row).addClass('selected');
            }
        }
    });
 
    $('#select tbody').on('click', 'tr', function () {
        var id = this.id;
        var index = $.inArray(id, selected);
 
        if ( index === -1 ) {
            selected.push( id );
        } else {
            selected.splice( index, 1 );
        }
 
        $(this).toggleClass('selected');
    } );
} );