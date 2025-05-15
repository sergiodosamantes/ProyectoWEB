document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("publicaciones");
  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "/login";
    return;
  }

  // Mostrar menú admin 
  try {
    if (token.split('.').length === 3) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.rol === "admin") {
        document.getElementById("nav-admin")?.classList.remove("d-none");
      }
    }
  } catch (e) {
    console.error("Error al verificar rol de usuario:", e);
  }

  // Cargar etiquetas en el selector
  try {
    const res = await fetch("/etiquetas");
    const etiquetas = await res.json();
    const select = document.getElementById("filtro-etiqueta");
    if (select) {
      select.innerHTML = '<option value="">-- Todas --</option>';
      etiquetas.forEach(et => {
        const option = document.createElement("option");
        option.value = et.nombre;
        option.textContent = et.nombre;
        select.appendChild(option);
      });
    }
  } catch (e) {
    console.error("Error al cargar etiquetas:", e);
  }

  // Cargar todas las publicaciones al inicio
  try {
    const res = await fetch("/publicaciones");
    const publicaciones = await res.json();
    mostrarPublicaciones(publicaciones);
  } catch (err) {
    console.error("Error al cargar publicaciones:", err);
    contenedor.innerHTML = "<p>Error al conectar con el servidor.</p>";
  }
});

// Mostrar publicaciones
function mostrarPublicaciones(publicaciones) {
  const contenedor = document.getElementById("publicaciones");

  if (!Array.isArray(publicaciones)) {
    contenedor.innerHTML = "<p>No se pudieron cargar las publicaciones.</p>";
    return;
  }

  if (publicaciones.length === 0) {
    contenedor.innerHTML = "<p>No hay publicaciones todavía.</p>";
    return;
  }

  contenedor.innerHTML = publicaciones.map(pub => `
    <div class="list-group-item mb-3 shadow-sm">
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${pub.titulo}</h5>
        <small>ID: ${pub._id}</small>
      </div>
      <p class="mb-1">${pub.contenido}</p>
      ${pub.archivoBase64 && pub.archivoTipo?.startsWith("image/")
        ? `<img src="data:${pub.archivoTipo};base64,${pub.archivoBase64}" style="max-width:100%;border-radius:10px;margin-top:10px;" />`
        : ""
      }
      <div>
        <button class="btn btn-sm btn-outline-success me-1">
          + Votar<span>${pub.votosPositivos || 0}</span>
        </button>
        <button class="btn btn-sm btn-outline-danger me-1">
          - Votar<span>${pub.votosNegativos || 0}</span>
        </button>
        <button class="btn btn-sm btn-outline-secondary" onclick="verDetalle('${pub._id}')">
          Ver más
        </button>
      </div>
    </div>
  `).join('');
}

function verDetalle(id) {
  window.location.href = `/detail?id=${id}`;
}

// Filtrar solo por etiqueta
async function filtrarPorEtiqueta() {
  const etiqueta = document.getElementById("filtro-etiqueta")?.value;

  try {
    const res = await fetch("/publicaciones");
    const publicaciones = await res.json();

    const filtradas = etiqueta
      ? publicaciones.filter(pub => pub.etiquetas.includes(etiqueta))
      : publicaciones;

    mostrarPublicaciones(filtradas);
  } catch (err) {
    console.error("Error al filtrar publicaciones:", err);
    document.getElementById("publicaciones").innerHTML = "<p>Error al aplicar filtro.</p>";
  }
}
