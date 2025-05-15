document.addEventListener("DOMContentLoaded", () => {
  // Traer las etiquetas desde el backend para mostrarlas como opciones 
  fetch('/etiquetas')
  .then(res => res.json())
  .then(etiquetas => {
    const container = document.getElementById("tags-container");
    // Checkbox para cada etiqeuta 
    etiquetas.forEach(et => {
      const label = document.createElement("label");
      label.className = "form-check form-check-inline";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = "form-check-input";
      input.name = "etiquetas";
      input.value = et.nombre;
      input.addEventListener("change", limitarSeleccion);

      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + et.nombre));
      container.appendChild(label);
    });
  });

// Solo permitir usar 2 etiquetas 
function limitarSeleccion() {
  const seleccionadas = document.querySelectorAll('input[name="etiquetas"]:checked');
  if (seleccionadas.length > 2) {
    this.checked = false;
    alert("Solo puedes seleccionar 2 etiquetas.");
  }
}
  const form = document.querySelector("form");
  // decodificar el token para traer los datos del user 
  function obtenerUsuarioDesdeToken() {
    const token = sessionStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = obtenerUsuarioDesdeToken();
    if (!usuario) {
      alert("Debes iniciar sesión para publicar.");
      window.location.href = "/login";
      return;
    }
  // Obtenemr los valores del formulario
    const titulo = document.getElementById("title").value.trim();
    const contenido = document.getElementById("content").value.trim();
    const etiquetas = Array.from(document.querySelectorAll('input[name="etiquetas"]:checked')).map(e => e.value);
    const archivo = document.getElementById("attachment").files[0];

    if (!titulo || !contenido) {
      alert("Título y contenido son obligatorios.");
      return;
    }

    if (archivo) {
      const reader = new FileReader();
      if (!["image/png", "image/jpeg", "video/mp4"].includes(archivo.type)) {
        alert("Solo se permiten imágenes PNG/JPEG o videos MP4");
        return;
      }
      reader.readAsDataURL(archivo);
      reader.onload = async () => {
        const base64String = reader.result.split(',')[1];
        const tipoArchivo = archivo.type;
        // mandar la publi al backend 
        await enviarPublicacion({
          titulo,
          contenido,
          autorId: usuario.id,
          etiquetas,
          archivoBase64: base64String,
          archivoTipo: tipoArchivo,
          resuelto: false
        });
      };
      // Si no hay archivo
    } else {
      await enviarPublicacion({
        titulo,
        contenido,
        autorId: usuario.id,
        etiquetas,
        archivoBase64: null,
        archivoTipo: null,
        resuelto: false
      });
    }
  });

  async function enviarPublicacion(publicacion) {
    try {
      const res = await fetch("/publicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publicacion)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo crear la publicación.");
        return;
      }

      alert("¡Publicación creada con éxito!");
      window.location.href = "/feed";
    } catch (error) {
      console.error("Error al crear publicación:", error);
      alert("Error al conectar con el servidor.");
    }
  }
});
