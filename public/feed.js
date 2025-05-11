document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("publicaciones");

  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "/login";
    return;
  }

  try {
    const res = await fetch("/publicaciones");
    const publicaciones = await res.json();

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
        <div>
          <button class="btn btn-sm btn-outline-success me-1">+ Votar</button>
          <button class="btn btn-sm btn-outline-danger me-1">- Votar</button>
          <button class="btn btn-sm btn-outline-secondary" onclick="verDetalle('${pub._id}')">Ver más</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Error al cargar publicaciones:", err);
    contenedor.innerHTML = "<p>Error al conectar con el servidor.</p>";
  }
});

function verDetalle(id) {
  window.location.href = `/detail?id=${id}`;
}
