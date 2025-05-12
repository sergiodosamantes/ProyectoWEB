function obtenerUsuarioDesdeToken() {
  const token = sessionStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    console.error("Token inválido:", e);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("detalle-publicacion");
  const pubId = new URLSearchParams(window.location.search).get("id");

  if (!pubId) {
    contenedor.innerHTML = "<p>Error: No se encontró la publicación.</p>";
    return;
  }

  const usuario = obtenerUsuarioDesdeToken();
  if (!usuario) {
    alert("Debes iniciar sesión.");
    window.location.href = "/login";
    return;
  }

  try {
    const res = await fetch(`/publicaciones/${pubId}`);
    const pub = await res.json();

    if (!res.ok || !pub.titulo) {
      contenedor.innerHTML = "<p>No se pudo cargar la publicación.</p>";
      return;
    }

    const esAutor = usuario.id === pub.autorId;
    const esAdmin = usuario.rol?.toLowerCase().includes("admin");
    contenedor.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3>${pub.titulo}</h3>
          <small class="text-muted">Publicado por <a href="/perfil?id=${pub.autorId}">${pub.autorId}</a> - ${new Date(pub.fecha).toLocaleString()}</small>
        </div>
        <div class="dropdown">
          <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            <i class="bi bi-three-dots"></i>
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Reportar</a></li>
            ${esAutor ? `<li><a class="dropdown-item" href="#" id="btn-editar">Editar publicación</a></li>` : ""}
            ${esAutor ? `<li><a class="dropdown-item text-danger" href="#" id="btn-eliminar">Eliminar publicación</a></li>` : ""}
            ${esAdmin ? `<li><a class="dropdown-item text-danger" href="#">Bloquear usuario</a></li>` : ""}
          </ul>
        </div>
      </div>

      <p id="contenido-publicacion">${pub.contenido}</p>
      <div class="mt-3">
        ${(pub.etiquetas || []).map(tag => `<span class="tag">${tag}</span>`).join(' ')}
      </div>

      <div class="d-flex align-items-center mt-3">
        <button class="btn btn-sm btn-outline-success me-1 btn-vote up">
          + <span class="vote-count-up">0</span>
        </button>
        <button class="btn btn-sm btn-outline-danger me-3 btn-vote down">
          - <span class="vote-count-down">0</span>
        </button>
        <button class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-chat-left-text"></i>
          <span id="contador-comentarios">0</span> comentarios
        </button>
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

    // Agregar modal de edición si es autor
    if (esAutor) {
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
                    <label for="editar-etiquetas" class="form-label">Etiquetas</label>
                    <input type="text" class="form-control" id="editar-etiquetas" value="${(pub.etiquetas || []).join(', ')}">
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

      document.getElementById("btn-editar").addEventListener("click", (e) => {
        e.preventDefault();
        const modal = new bootstrap.Modal(document.getElementById("editarModal"));
        modal.show();
      });

      document.getElementById("btn-guardar-edicion").addEventListener("click", async () => {
        const titulo = document.getElementById("editar-titulo").value.trim();
        const contenido = document.getElementById("editar-contenido").value.trim();
        const etiquetasTexto = document.getElementById("editar-etiquetas").value.trim();
        const resuelto = document.getElementById("editar-resuelto").checked;
        const etiquetas = etiquetasTexto ? etiquetasTexto.split(",").map(t => t.trim()) : [];

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

    // Cargar votos
    const votosRes = await fetch(`/publicaciones/${pubId}/votos`);
    const votos = await votosRes.json();
    document.querySelector(".vote-count-up").textContent = votos.votosPositivos;
    document.querySelector(".vote-count-down").textContent = votos.votosNegativos;

    const votoRes = await fetch(`/publicaciones/${pubId}/voto/${usuario.id}`);
    const voto = await votoRes.json();
    if (voto?.tipo === "up") document.querySelector(".btn-vote.up").classList.add("active");
    if (voto?.tipo === "down") document.querySelector(".btn-vote.down").classList.add("active");

    document.querySelector(".btn-vote.up").addEventListener("click", () => votar(pubId, "up", usuario.id));
    document.querySelector(".btn-vote.down").addEventListener("click", () => votar(pubId, "down", usuario.id));

    await cargarComentarios(pubId, usuario);

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

  } catch (err) {
    console.error("Error general:", err);
    contenedor.innerHTML = "<p>Error al conectar con el servidor.</p>";
  }
});

// Votar publicación
async function votar(id, tipo, userId) {
  const check = await fetch(`/publicaciones/${id}/voto/${userId}`);
  const voto = await check.json();
  if (voto?.tipo === tipo) return alert("Ya votaste esto.");

  const res = await fetch(`/publicaciones/${id}/votar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo, usuarioId: userId })
  });

  const data = await res.json();
  if (!res.ok) return alert(data.error || "Error al votar");

  document.querySelector(".vote-count-up").textContent = data.votosPositivos;
  document.querySelector(".vote-count-down").textContent = data.votosNegativos;

  document.querySelectorAll(".btn-vote").forEach(btn => btn.classList.remove("active"));
  document.querySelector(`.btn-vote.${tipo}`).classList.add("active");
}
async function cargarComentarios(pubId, usuario) {
  const contenedor = document.getElementById("comentarios-lista");

  try {
    const res = await fetch(`/publicaciones/${pubId}/comentarios`);
    const comentarios = await res.json();
    document.getElementById("contador-comentarios").textContent = comentarios.length;
    contenedor.innerHTML = "";

    const comentariosPorId = {};
    const comentariosRaiz = [];

    for (const com of comentarios) {
      comentariosPorId[com._id] = { ...com, hijos: [] };
    }
    for (const com of comentarios) {
      if (com.parentId) {
        comentariosPorId[com.parentId]?.hijos.push(comentariosPorId[com._id]);
      } else {
        comentariosRaiz.push(comentariosPorId[com._id]);
      }
    }

    const renderComentarios = (lista, nivel = 0) => {
      const fragmento = document.createDocumentFragment();

      for (const com of lista) {
        const div = document.createElement("div");
        div.className = "comment bg-light p-3 mb-3 border rounded";
        div.style.marginLeft = `${nivel * 30}px`;
        const esAutor = usuario.id === com.autorId;

        div.innerHTML = `
          <div class="d-flex justify-content-between">
            <strong>${com.autorNombre}</strong>
            <div class="dropdown">
              <button class="btn btn-sm btn-light dropdown-toggle" data-bs-toggle="dropdown">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu">
                ${esAutor ? `<li><a class="dropdown-item btn-edit-comentario" data-id="${com._id}">Editar</a></li>` : ""}
                ${esAutor ? `<li><a class="dropdown-item btn-delete-comentario text-danger" data-id="${com._id}">Eliminar</a></li>` : ""}
              </ul>
            </div>
          </div>
          <p class="mt-2" id="contenido-${com._id}">${com.contenido}</p>
          <div class="d-flex flex-wrap align-items-center gap-2 mt-2">
            <div class="btn-group" role="group" aria-label="Votos">
            <button class="btn btn-sm btn-outline-success btn-vote-comment" data-id="${com._id}" data-type="up">
              + <span id="voto-up-${com._id}" class="ms-1">0</span>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-vote-comment" data-id="${com._id}" data-type="down">
              − <span id="voto-down-${com._id}" class="ms-1">0</span>
            </button>
          </div>
            <button class="btn btn-sm btn-outline-primary btn-responder" data-id="${com._id}">Responder</button>
          </div>
          <div id="responder-${com._id}" class="mt-2 d-none">
            <textarea class="form-control mb-2" rows="2" placeholder="Tu respuesta..." required></textarea>
            <button class="btn btn-sm btn-primary btn-enviar-respuesta" data-id="${com._id}">Enviar</button>
          </div>
        `;
        fragmento.appendChild(div);

        // Mostrar contador
        (async () => {
          const resVotos = await fetch(`/publicaciones/comentarios/${com._id}/votos`);
          const { votosPositivos, votosNegativos } = await resVotos.json();
          document.getElementById(`voto-up-${com._id}`).textContent = votosPositivos;
          document.getElementById(`voto-down-${com._id}`).textContent = votosNegativos;
        })();
        // Votar comentario
        div.querySelectorAll(".btn-vote-comment").forEach(btn => {
          btn.addEventListener("click", async () => {
            const tipo = btn.dataset.type;
            const id = btn.dataset.id;
            const check = await fetch(`/publicaciones/comentarios/${id}/voto/${usuario.id}`);
            const voto = await check.json();
            if (voto?.tipo === tipo) return alert("Ya votaste esto.");
            await fetch(`/publicaciones/comentarios/${id}/votar`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tipo, usuarioId: usuario.id })
            });
            await cargarComentarios(pubId, usuario);
          });
        });

        // Mostrar/ocultar formulario de respuesta
        div.querySelector(".btn-responder").addEventListener("click", () => {
          const formulario = div.querySelector(`#responder-${com._id}`);
          formulario.classList.toggle("d-none");
        });

        // Enviar respuesta
        div.querySelector(".btn-enviar-respuesta").addEventListener("click", async () => {
          const textarea = div.querySelector(`#responder-${com._id} textarea`);
          const texto = textarea.value.trim();
          if (!texto) return alert("Comentario vacío");
          await fetch(`/publicaciones/${pubId}/comentarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contenido: texto,
              autorId: usuario.id,
              autorNombre: usuario.nombre,
              parentId: com._id
            })
          });
          await cargarComentarios(pubId, usuario);
        });

        // Editar comentario
        if (esAutor) {
          div.querySelector(".btn-edit-comentario")?.addEventListener("click", async () => {
            const actual = document.getElementById(`contenido-${com._id}`).textContent;
            const nuevo = prompt("Editar comentario:", actual);
            if (!nuevo) return;
            await fetch(`/publicaciones/comentarios/${com._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contenido: nuevo.trim(), usuarioId: usuario.id })
            });
            await cargarComentarios(pubId, usuario);
          });

          div.querySelector(".btn-delete-comentario")?.addEventListener("click", async () => {
            if (!confirm("¿Eliminar este comentario?")) return;
            await fetch(`/publicaciones/comentarios/${com._id}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ usuarioId: usuario.id })
            });
            await cargarComentarios(pubId, usuario);
          });
        }

        // Mostrar respuestas hijas
        if (com.hijos.length > 0) {
          fragmento.appendChild(renderComentarios(com.hijos, nivel + 1));
        }
      }

      return fragmento;
    };

    contenedor.appendChild(renderComentarios(comentariosRaiz));
  } catch (err) {
    console.error("Error cargando comentarios:", err);
    contenedor.innerHTML = "<p>Error al cargar comentarios.</p>";
  }
}
