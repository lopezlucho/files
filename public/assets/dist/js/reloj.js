function actual() {
         fecha=new Date(); //Actualizar fecha.
         anio=fecha.getFullYear();
         mes=(fecha.getMonth()+1).toString();
         dia=fecha.getDate().toString();
         hora=fecha.getHours(); //hora actual
         minuto=fecha.getMinutes(); //minuto actual
         segundo=fecha.getSeconds(); //segundo actual
         if (mes.length < 2) {
            mes = '0' + mes;
             }
         if (dia.length < 2) {
            dia = '0' + dia;
             }
         if (hora<10) { //dos cifras para la hora
             hora="0"+hora;
             }
         if (minuto<10) { //dos cifras para el minuto
             minuto="0"+minuto;
             }
         if (segundo<10) { //dos cifras para el segundo
             segundo="0"+segundo;
             }
         //devolver los datos:
         mireloj = anio+"/"+mes+"/"+dia+" "+hora+":"+minuto+":"+segundo;	
         return mireloj; 
         }
         
function actualizar() { //función del temporizador
   mihora=actual(); //recoger hora actual
   mireloj=document.getElementById("reloj"); //buscar elemento reloj
   mireloj.innerHTML=mihora; //incluir hora en elemento
	 }
	 
setInterval(actualizar,1000); //iniciar temporizador