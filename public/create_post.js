document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

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

    const titulo = document.getElementById("title").value.trim();
    const contenido = document.getElementById("content").value.trim();
    const etiquetasTexto = document.getElementById("tags").value.trim();
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

        await enviarPublicacion({
          titulo,
          contenido,
          autorId: usuario.id,
          etiquetas: etiquetasTexto ? etiquetasTexto.split(",").map(e => e.trim()) : [],
          archivoBase64: base64String,
          archivoTipo: tipoArchivo,
          resuelto: false
        });
      };
    } else {
      await enviarPublicacion({
        titulo,
        contenido,
        autorId: usuario.id,
        etiquetas: etiquetasTexto ? etiquetasTexto.split(",").map(e => e.trim()) : [],
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
