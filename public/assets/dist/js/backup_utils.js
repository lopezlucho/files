function respalda(){
           $.ajax({
               beforeSend: function(){
               $("#btn-procede").prop("disabled", true)
               $("#respuesta").html("<font color='#99CCFF'>Respaldando base de datos... </font><img src='dist/img/loader.gif' style='width:30px;height:30px;'></img>");
               },
               url: 'backup_crea_respaldo.php',
               type: 'POST',
               data: null,
               success: function(x){
                $("#respuesta").html(x);
               },
              error: function(jqXHR,estado,error){
               $("#respuesta").html('Hubo un error al generar el respaldo!!!Reporte a soporte...'+'     '+estado +' '+error);
              }
            });
    }