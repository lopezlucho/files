document.addEventListener("DOMContentLoaded", () => {
	const $btnSubir = document.querySelector("#subir");
	const $btnIzquierda = document.querySelector("#izquierda");
	const $btnDerecha = document.querySelector("#derecha");
	const $btnIzquierda90 = document.querySelector("#izquierda90");
	const $btnDerecha90 = document.querySelector("#derecha90");
	const $btnreset = document.querySelector("#reset");
	const $imagen = document.querySelector("#imagen");
	const $img = document.querySelector("#img");
	const $btnnombre = document.querySelector("#cambiar_nombre");
	const $nombre = document.getElementById("nuevo_nombre").value;
	const $btnqr = document.querySelector("#qr");
	console.log("La imagen original es " + img.value);

	let cropper = new Cropper($imagen, {
		responsive: true, // <-- Si no se pone en false, la imagen se mueve cuando cambia el tamaño de la ventana
		autoCropArea: true,
		rotatable: true,
		zoomOnWheel: false,
		//viewMode: 2,
	});

	$btnSubir.onclick = async () => {
		if (!cropper) {
			return;
		}
		// Obtener el canvas recortado
		const canvas = cropper.getCroppedCanvas();

		// Convertir la imagen a Base64 y ponerlo en el enlace
		const data = canvas.toDataURL("image/jpeg");
		const fd = new FormData();
		fd.append("imagen", data); // Se llama "imagen", en PHP lo recuperamos con $_POST["imagen"]
		fd.append("img", img.value); // Se llama "img", en PHP lo recuperamos con $_POST["img"]
		const respuestaHttp = await fetch("imagen.php", {
			method: "POST",
			body: fd,
		});
		const nombreImagenSubida = await respuestaHttp.json();
		console.log("La imagen " + img + " ha sido enviada y tiene el nombre de: " + nombreImagenSubida);
		window.location.reload();

	};

	$btnIzquierda.onclick = async () => {
	    console.log("Giro Izquierda");
	    cropper.rotate(-0.1);
	};

	$btnDerecha.onclick = async () => {
	    console.log("Giro Derecha");
	    cropper.rotate(0.1);
	};

	$btnIzquierda90.onclick = async () => {
	    console.log("Giro Izquierda 90");
	    cropper.rotate(-90);
	};

	$btnDerecha90.onclick = async () => {
	    console.log("Giro Derecha 90");
	    cropper.rotate(90);
	};

	$btnreset.onclick = async () => {
	    console.log("Reiniciar");
	    cropper.reset();
	};

	$btnnombre.onclick = async () => {
	    let $nombre = document.getElementById("nuevo_nombre").value;
	    const file_path = img.value;
        const dir_name = file_path.substring(0, file_path.lastIndexOf('/'));
        const extension = file_path.split('.').pop();
        const new_file_path = `${dir_name}/${$nombre}.${extension}`;

        const fd = new FormData();
		fd.append("nuevo_nombre", $nombre);
		fd.append("archivo", file_path);
        fd.append("ajax", "true"); // Add ajax parameter
		const respuestaHttp = await fetch("renombrar.php", {
			method: "POST",
			body: fd,
		});
        const response = await respuestaHttp.text();
        if (response.trim() === "success") {
		    window.location.assign(`recortar.php?img=${new_file_path}`);
        } else {
            alert("Error al renombrar el archivo.");
        }
    };

    document.getElementById("nuevo_nombre").onkeyup = function() {nuevo_nombreFunction()};
    
    function nuevo_nombreFunction() {
        var keyValue = event.key;
        var codeValue = event.code;
        if (keyValue == "Enter") {
            $btnnombre.onclick();
        }
    };

	$btnqr.onclick = async () => {
	    let $nombre = document.getElementById("nuevo_nombre").value;
	    const file = img.value.split("/");
		window.location.assign("decode.php?source=" + file[3] + "&file=" + file[4] );
    };

});