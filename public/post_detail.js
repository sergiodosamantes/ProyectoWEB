document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("detalle-publicacion");
    const pubId = localStorage.getItem("pubId");
    const usuario = JSON.parse(localStorage.getItem("usuario"));
  
    if (!pubId) {
      contenedor.innerHTML = "<p>Error: No se encontró la publicación.</p>";
      return;
    }
  
    try {
      const res = await fetch(`/publicaciones/${pubId}`);
      const pub = await res.json();
  
      if (!res.ok || !pub.titulo) {
        contenedor.innerHTML = "<p>No se pudo cargar la publicación.</p>";
        return;
      }
         // Determina si el usuario es el autor o admin
 
      const esAutor = usuario && usuario.id === pub.autorId;
      const esAdmin = usuario && usuario.rol === 'admin';
    // Genera el HTML de la publicación con sus datos

      contenedor.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3>${pub.titulo}</h3>
            <small class="text-muted">Publicado por <a href="/perfil">${pub.autorId}</a> - ${new Date(pub.fecha).toLocaleString()}</small>
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
            + <span class="vote-count-up">${pub.votosPositivos ?? 0}</span>
          </button>
          <button class="btn btn-sm btn-outline-danger me-3 btn-vote down">
            - <span class="vote-count-down">${pub.votosNegativos ?? 0}</span>
          </button>
          <button class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-chat-left-text"></i> 0 comentarios
          </button>
        </div>
      `;
  
      contenedor.querySelector(".btn-vote.up").addEventListener("click", async () => {
        await votar(pub.id, "up");
      });
  
      contenedor.querySelector(".btn-vote.down").addEventListener("click", async () => {
        await votar(pub.id, "down");
      });
    // Si el usuario es el autor, muestra opciones de edición
  
      if (esAutor) {
        contenedor.insertAdjacentHTML("beforeend", `
          <div class="mt-4 p-3 border rounded bg-light" id="form-edicion" style="display:none;">
            <h5>Editar publicación</h5>
            <form id="editar-form">
              <div class="mb-2">
                <label class="form-label">Título</label>
                <input type="text" class="form-control" id="edit-titulo" value="${pub.titulo}">
              </div>
              <div class="mb-2">
                <label class="form-label">Contenido</label>
                <textarea class="form-control" id="edit-contenido" rows="4">${pub.contenido}</textarea>
              </div>
              <div class="mb-2">
                <label class="form-label">Etiquetas (separadas por coma)</label>
                <input type="text" class="form-control" id="edit-etiquetas" value="${(pub.etiquetas || []).join(', ')}">
              </div>
              <button type="submit" class="btn btn-primary">Guardar cambios</button>
            </form>
          </div>
        `);
  
        document.getElementById("btn-editar").addEventListener("click", e => {
          e.preventDefault();
          document.getElementById("form-edicion").style.display = "block";
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        });
  
        document.getElementById("editar-form").addEventListener("submit", async e => {
          e.preventDefault();
          const titulo = document.getElementById("edit-titulo").value.trim();
          const contenido = document.getElementById("edit-contenido").value.trim();
          const etiquetas = document.getElementById("edit-etiquetas").value.split(',').map(e => e.trim());
  
          try {
            const res = await fetch(`/publicaciones/${pub.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ titulo, contenido, etiquetas, autorId: usuario.id })
            });
  
            const data = await res.json();
            if (!res.ok) {
              alert(data.mensaje || "Error al actualizar");
              return;
            }
  
            alert("Actualizado");
            location.reload();
          } catch (err) {
            console.error("Error:", err);
            alert("Error al conectar con el servidor");
          }
        });
        // eliminar la publicación si el usuario es el autor
        document.getElementById("btn-eliminar").addEventListener("click", async e => {
          e.preventDefault();
          if (!confirm("¿Deseas eliminar esta publicación?")) return;
  
          try {
            const res = await fetch(`/publicaciones/${pub.id}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ autorId: usuario.id })
            });
  
            const data = await res.json();
            if (!res.ok) {
              alert(data.mensaje || "No se pudo eliminar");
              return;
            }
  
            alert("Publicación eliminada");
            location.href = "/feed";
          } catch (err) {
            console.error(err);
            alert("Error al eliminar");
          }
        });
      }
  
      // Comentarios
      const comentariosContenedor = document.createElement("div");
      comentariosContenedor.id = "comentarios";
      comentariosContenedor.classList.add("mt-4");
      comentariosContenedor.innerHTML = `
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
      `;
  
      contenedor.appendChild(comentariosContenedor);
  
      async function cargarComentarios() {
        try {
          const res = await fetch(`/publicaciones/${pub.id}/comentarios`);
          const lista = await res.json();
  
          const divLista = document.getElementById("comentarios-lista");
          divLista.innerHTML = "";
  
          lista.forEach(com => {
            divLista.innerHTML += `
              <div class="comment shadow-sm">
                <div class="d-flex justify-content-between">
                  <strong>${com.autorNombre || 'Usuario'}</strong>
                  <small class="text-muted">${new Date(com.fecha).toLocaleString()}</small>
                </div>
                <p class="mt-2">${com.contenido}</p>
              </div>
            `;
          });
        } catch (err) {
          console.error("Error al cargar comentarios:", err);
        }
      }
  
      cargarComentarios();
  
      document.getElementById("comentario-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const texto = document.getElementById("comentario-texto").value.trim();
  
        if (!texto) return alert("Comentario vacío");
  
        try {
          const res = await fetch(`/publicaciones/${pub.id}/comentarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contenido: texto,
              autorId: usuario.id,
              autorNombre: usuario.nombre,
              fecha: new Date().toISOString()
            })
          });
  
          if (!res.ok) {
            alert("Error al comentar");
            return;
          }
  
          document.getElementById("comentario-texto").value = "";
          await cargarComentarios();
        } catch (err) {
          console.error("Error al enviar comentario:", err);
          alert("No se pudo enviar el comentario");
        }
      });
  
    } catch (err) {
      console.error("Error al obtener publicación:", err);
      contenedor.innerHTML = "<p>Error al conectar con el servidor.</p>";
    }
  });

  // Manejo de votos
  
  async function votar(id, tipo) {
    const votoKey = `voto_pub_${id}`;
    const votoPrevio = localStorage.getItem(votoKey);
  
    if (votoPrevio === tipo) {
      alert("Ya votaste esto.");
      return;
    }
  
    try {
      const res = await fetch(`/publicaciones/${id}/votar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, tipoAnterior: votoPrevio || null })
      });
  
      const data = await res.json();
  
      document.querySelector(".vote-count-up").textContent = data.votosPositivos ?? 0;
      document.querySelector(".vote-count-down").textContent = data.votosNegativos ?? 0;
  
      localStorage.setItem(votoKey, tipo);
    } catch (err) {
      console.error("Error al votar:", err);
      alert("Error al votar");
    }
  }
  