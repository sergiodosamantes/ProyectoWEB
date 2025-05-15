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

    // respuestas en hilo tipo  redit
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
            ${esAutor
            ? `
                <li><a class="dropdown-item btn-edit-comentario" data-id="${com._id}">Editar</a></li>
                <li><a class="dropdown-item btn-delete-comentario text-danger" data-id="${com._id}">Eliminar</a></li>
              `
            : `
                <li><a class="dropdown-item text-danger" href="#">Reportar</a></li>
              `
          }
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
