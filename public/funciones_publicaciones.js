// Mostrar error si algo sale mal
function mostrarError(msg) {
  const contenedor = document.getElementById("detalle-publicacion");
  contenedor.innerHTML = `<p class="text-danger">${msg}</p>`;
}

// Cargar una publicación específica
async function cargarPublicacion(id) {
  const res = await fetch(`/publicaciones/${id}`);
  const pub = await res.json();
  if (!res.ok || !pub) throw new Error("No se pudo cargar publicación");
  return pub;
}

// Mostrar el HTML de la publicación
function mostrarDetalle(pub, usuario) {
  const contenedor = document.getElementById("detalle-publicacion");
  const esAutor = usuario.id === pub.autorId;
  const esAdmin = usuario.rol?.toLowerCase().includes("admin");

  contenedor.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3>${pub.titulo}</h3>
        <small class="text-muted">Publicado por <a href="/perfil?id=${pub.nombre}">${pub.autorId}</a> - ${new Date(pub.fecha).toLocaleString()}</small>
      </div>
      <div class="dropdown">
        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
          <i class="bi bi-three-dots"></i>
        </button>
        <ul class="dropdown-menu">
          ${!esAutor ? `<li><a class="dropdown-item text-warning btn-reportar" href="#" data-id="${pub._id}" data-tipo="Publicacion">Reportar</a></li>` : ""}
          ${(esAutor || esAdmin) ? `<li><a class="dropdown-item" href="#" id="btn-editar">Editar publicación</a></li>` : ""}
          ${(esAutor || esAdmin) ? `<li><a class="dropdown-item text-danger" href="#" id="btn-eliminar">Eliminar publicación</a></li>` : ""}
        </ul>
      </div>
    </div>
    <p id="contenido-publicacion">${pub.contenido}</p>
    ${pub.archivoBase64 && pub.archivoTipo?.startsWith("image/") ? `<img src="data:${pub.archivoTipo};base64,${pub.archivoBase64}" style="max-width:100%;border-radius:10px;margin-top:15px;" />` : ""}
    <div class="mt-3">
      ${(pub.etiquetas || []).map(tag => `<span class="tag badge bg-primary me-1">${tag}</span>`).join(' ')}
    </div>
    <div class="d-flex align-items-center mt-3">
      <button class="btn btn-sm btn-outline-success me-1 btn-vote up">+ <span class="vote-count-up">0</span></button>
      <button class="btn btn-sm btn-outline-danger me-3 btn-vote down">- <span class="vote-count-down">0</span></button>
      <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-chat-left-text"></i> <span id="contador-comentarios">0</span> comentarios</button>
    </div>
    <div id="comentarios" class="mt-4">
      <div class="comment-form shadow-sm">
        <h5>Agregar un comentario</h5>
        <form id="comentario-form">
          <textarea class="form-control mb-2" id="comentario-texto" rows="3" placeholder="Escribe tu comentario aquí..." required></textarea>
          <button type="submit" class="btn btn-primary">Publicar comentario</button>
        </form>
      </div>
      <div class="comments-header shadow-sm mt-4">
        <i class="bi bi-chat-square-text"></i> Comentarios
      </div>
      <div id="comentarios-lista" class="mt-2"></div>
    </div>
  `;
}

// Modal de edición de publicaciones
async function prepararModalEdicion(pub, usuario) {
  const modalEditar = document.createElement("div");
  modalEditar.innerHTML = `
    <div class="modal fade" id="editarModal" tabindex="-1" aria-labelledby="editarModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editarModalLabel">Editar publicación</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <form id="editar-form">
              <div class="mb-3">
                <label for="editar-titulo" class="form-label">Título</label>
                <input type="text" class="form-control" id="editar-titulo" value="${pub.titulo}" required>
              </div>
              <div class="mb-3">
                <label for="editar-contenido" class="form-label">Contenido</label>
                <textarea class="form-control" id="editar-contenido" rows="8" required>${pub.contenido}</textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Etiquetas</label>
                <div id="editar-tags-container" class="d-flex flex-wrap gap-2"></div>
                <small class="text-muted">Máximo 2 etiquetas</small>
              </div>
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="editar-resuelto" ${pub.resuelto ? "checked" : ""}>
                <label class="form-check-label" for="editar-resuelto">Marcar como resuelto</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-guardar-edicion">Guardar cambios</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalEditar);

  const res = await fetch('/etiquetas');
  const etiquetasDisponibles = await res.json();
  const container = document.getElementById("editar-tags-container");
  container.innerHTML = '';
  etiquetasDisponibles.forEach(et => {
    const label = document.createElement("label");
    label.className = "form-check form-check-inline";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "form-check-input";
    input.name = "editar-etiquetas";
    input.value = et.nombre;

    if (pub.etiquetas?.includes(et.nombre)) {
      input.checked = true;
    }

    input.addEventListener("change", () => {
      const seleccionadas = document.querySelectorAll('input[name="editar-etiquetas"]:checked');
      if (seleccionadas.length > 2) {
        input.checked = false;
        alert("Solo puedes seleccionar hasta 2 etiquetas.");
      }
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + et.nombre));
    container.appendChild(label);
  });

  document.getElementById("btn-editar").addEventListener("click", (e) => {
    e.preventDefault();
    const modal = new bootstrap.Modal(document.getElementById("editarModal"));
    modal.show();
  });

  document.getElementById("btn-guardar-edicion").addEventListener("click", async () => {
    const titulo = document.getElementById("editar-titulo").value.trim();
    const contenido = document.getElementById("editar-contenido").value.trim();
    const resuelto = document.getElementById("editar-resuelto").checked;
    const etiquetas = Array.from(document.querySelectorAll('input[name="editar-etiquetas"]:checked')).map(e => e.value);

    if (!titulo || !contenido) return alert("Título y contenido obligatorios");

    const res = await fetch(`/publicaciones/${pub._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, contenido, etiquetas, resuelto, autorId: usuario.id })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Error al actualizar");
    alert("Actualizado correctamente");
    location.reload();
  });

  document.getElementById("btn-eliminar").addEventListener("click", async (e) => {
    e.preventDefault();
    if (!confirm("¿Eliminar publicación?")) return;

    const res = await fetch(`/publicaciones/${pub._id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autorId: usuario.id })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Error al eliminar");
    alert("Publicación eliminada");
    window.location.href = "/feed";
  });
}

// Formulario para agregar comentarios
function prepararComentarioNuevo(pubId, usuario) {
  document.getElementById("comentario-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const texto = document.getElementById("comentario-texto").value.trim();
    if (!texto) return alert("Comentario vacío");

    const res = await fetch(`/publicaciones/${pubId}/comentarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenido: texto, autorId: usuario.id, autorNombre: usuario.nombre })
    });

    if (!res.ok) return alert("Error al comentar");
    document.getElementById("comentario-texto").value = "";
    await cargarComentarios(pubId, usuario);
  });
}

// Mostrar el modal cuando se hace clic en "Reportar"
document.addEventListener("click", (e) => {
  if (e.target.matches(".btn-reportar")) {
    e.preventDefault();
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;

    document.getElementById("reporte-id").value = id;
    document.getElementById("reporte-tipo").value = tipo;
    document.getElementById("mensaje-reporte").value = "";

    document.getElementById("tipo-reporte-texto").textContent =
        `Estás reportando una ${tipo === "comentario" ? "comentario" : "publicación"}.`;

    const modal = new bootstrap.Modal(document.getElementById("modalReporte"));
    modal.show();
  }
});

async function enviarReporte() {
  const id = document.getElementById("reporte-id").value;
  const tipo = document.getElementById("reporte-tipo").value;
  const mensaje = document.getElementById("mensaje-reporte").value.trim();
  const token = sessionStorage.getItem("token");
  const usuario = obtenerUsuarioToken(); // desde utils.js

  if (!mensaje) {
    alert("El mensaje no puede estar vacío.");
    return;
  }

  try {
    const res = await fetch("/publicaciones/reportes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        refId: id,
        tipo: tipo === "comentario" ? "Comentario" : "Publicacion",
        comentarios: [mensaje],
        autorId: usuario.id,
        autorNombre: usuario.nombre
      })
    });

    const contentType = res.headers.get("content-type");

    if (!res.ok) {
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        alert(data.error || "Error al enviar el reporte.");
      }
      else {
        const text = await res.text(); // Puede ser HTML
        console.error("Respuesta no JSON del servidor:", text);
        alert("Error inesperado del servidor (no es JSON).");
      }
      return;
    }

    alert("Reporte enviado correctamente.");
    bootstrap.Modal.getInstance(document.getElementById("modalReporte")).hide();
  }
  catch (err) {
    console.error("Error al enviar reporte:", err);
    alert("Hubo un problema al enviar el reporte.");
  }
}
