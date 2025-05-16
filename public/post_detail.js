document.addEventListener("DOMContentLoaded", async () => {
  const usuario = obtenerUsuarioToken();
  if (!usuario) {
    alert("Debes iniciar sesión.");
    window.location.href = "/login";
    return;
  }

  const pubId = new URLSearchParams(window.location.search).get("id");
  if (!pubId) return mostrarError("No se encontró la publicación.");

  try {
    const pub = await cargarPublicacion(pubId);
    mostrarDetalle(pub, usuario);
    if (usuario.id === pub.autorId || usuario.rol === "admin") {
      await prepararModalEdicion(pub, usuario);
    }
    prepararVotacion(pubId, usuario);          
    await cargarComentarios(pubId, usuario);  
    prepararComentarioNuevo(pubId, usuario);  
  } catch (e) {
    console.error(e);
    mostrarError("Error al cargar la publicación.");
  }
});
