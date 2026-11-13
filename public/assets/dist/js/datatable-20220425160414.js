$(function () {

    const cabecera = '<div class="row"><div class="row"><div align="left" style="float:left" class="col-lg-3 col-3"><h3 class="bodyText" style="text-align:center;">EMPRESA MINERA COMERCIAL AGUILAR</br>Oruro - Bolivia</h3></div><div class="col-lg-6 col-6">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div><div align="right" style="float:right" class="col-lg-3 col-3"><img src="../imagenes/emica.jpg" width="300" height="70" /></div></div></div>';

    $("#example1").DataTable({
      "responsive": true, "lengthChange": false, "autoWidth": false,
      "buttons": ["copy", "csv", "excel", "pdf", "print", "colvis"]
    }).buttons().container().appendTo('#example1_wrapper .col-md-6:eq(0)');
    $('#analisis_pendientes').DataTable({
        "language": {
            "url": "../../Admin/plugins/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: [
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
    		className: 'btn btn-danger'
    	},
    	{
    		extend:    'print',
    		text:      '<i class="fa fa-print"></i> ',
    		titleAttr: 'Imprimir',
    		className: 'btn btn-info'
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
    ],
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
    $('#tabla_alta').DataTable({
        "language": {
            "url": "../../Admin/plugins/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: [
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
    		className: 'btn btn-danger'
    	},
    	{
    		extend:    'print',
    		text:      '<i class="fa fa-print"></i> ',
    		titleAttr: 'Imprimir',
    		className: 'btn btn-info'
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
    ],
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "ordering": true,
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
            "url": "../../Admin/plugins/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: [
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
    		className: 'btn btn-danger'
    	},
    	{
    		extend:    'print',
    		text:      '<i class="fa fa-print"></i> ',
    		titleAttr: 'Imprimir',
    		className: 'btn btn-info'
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
    ],
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "ordering": true,
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
            "url": "../../Admin/plugins/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: [
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
    		className: 'btn btn-danger'
    	},
    	{
    		extend:    'print',
    		text:      '<i class="fa fa-print"></i> ',
    		titleAttr: 'Imprimir',
    		className: 'btn btn-info'
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
    ],
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "ordering": true,
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
            "url": "../../Admin/plugins/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: [
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
    ],
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "ordering": true,
    "info": true,
    "autoWidth": true,
    "responsive": false,
    "ordering":true,
    "order": [
       [1, "asc"]
    ],
    });
    $('#tabla_librocompras').DataTable({
        "language": {
            "url": "../../Admin/plugins/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: [
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
    		pageSize: 'LETTER'
    	},
    	{
    		extend:    'print',
    		text:      '<i class="fa fa-print"></i> ',
    		titleAttr: 'Imprimir',
    		className: 'btn btn-info',
    		title: cabecera,
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
    ],
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "ordering": true,
    "info": true,
    "autoWidth": true,
    "responsive": false,
    "ordering":true,
    "order": [
       [1, "asc"]
    ],
    });
    $('#tabla_recepciones').DataTable({
        "language": {
            "url": "../../Admin/plugins/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: [
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
    		className: 'btn btn-danger'
    	},
    	{
    		extend:    'print',
    		text:      '<i class="fa fa-print"></i> ',
    		titleAttr: 'Imprimir',
    		className: 'btn btn-info'
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
    ],
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "ordering": true,
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
    $('#tabla_cotiz').DataTable({
        "language": {
            "url": "../../Admin/plugins/es-ES.json"
        },
    dom: 'Bfrtip',
    buttons: [
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
    		className: 'btn btn-danger'
    	},
    	{
    		extend:    'print',
    		text:      '<i class="fa fa-print"></i> ',
    		titleAttr: 'Imprimir',
    		className: 'btn btn-info'
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
    ],
    select: true,
    "lengthMenu": [ [10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "Todo"] ],
    "pageLength": -1,
    "pagingType": "full_numbers",
    "paging": true,
    "lengthChange": true,
    "searching": true,
    "ordering": true,
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