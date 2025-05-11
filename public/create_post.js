// Espera a que el DOM esté completamente cargado
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

    if (!titulo || !contenido) {
      alert("Título y contenido son obligatorios.");
      return;
    }

    const nuevaPublicacion = {
      titulo,
      contenido,
      autorId: usuario.id,
      etiquetas: etiquetasTexto ? etiquetasTexto.split(",").map(e => e.trim()) : [],
      fecha: new Date().toISOString(),
      votos: 0,
      resuelto: false
    };

    try {
      const res = await fetch("/publicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaPublicacion)
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
  });
});
