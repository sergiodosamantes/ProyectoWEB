const token = sessionStorage.getItem("token");

// Verifica si es un JWT válido
//https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
if (!token || token.split('.').length !== 3) {
  alert("No estás autenticado.");
  window.location.href = "/login";
}

// leer el rol
try {
  const payloadBase64 = token.split('.')[1];
  const payload = JSON.parse(atob(payloadBase64));

  if (payload.rol !== "admin") {
    alert("Acceso denegado. Solo administradores pueden entrar aquí.");
    window.location.href = "/feed";
  }
} catch (err) {
  alert("Token inválido.");
  window.location.href = "/login";
}
// Cargar nuestras etiquetas disponibles
async function cargarEtiquetas() {
  try {
    const res = await fetch('/etiquetas');
    const etiquetas = await res.json();
    const lista = document.getElementById('lista-etiquetas');
    lista.innerHTML = '';
    etiquetas.forEach(et => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = ` ${et.nombre} <button class="btn btn-sm btn-danger" onclick="eliminarEtiqueta('${et._id}')">Eliminar</button>`;
      lista.appendChild(li);
    });


  } catch (err) {
    console.error("Error al cargar etiquetas:", err);
    alert("No se pudieron cargar las etiquetas.");
  }
}

// Agregar etiquetas
async function agregarEtiqueta(e) {
  e.preventDefault();
  const nombre = document.getElementById("nueva-etiqueta").value.trim();
  if (!nombre) return;

  try {
    const res = await fetch('/etiquetas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ nombre })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al crear etiqueta");

    document.getElementById("nueva-etiqueta").value = '';
    cargarEtiquetas();
  } catch (err) {
    alert(err.message);
  }
}

// Eliminar etiqueta ya existente
async function eliminarEtiqueta(id) {
  if (!confirm("¿Eliminar esta etiqueta?")) return;

  try {
    const res = await fetch('/etiquetas/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al eliminar etiqueta");

    cargarEtiquetas();
  } catch (err) {
    alert(err.message);
  }
}

// Iniciar funciones al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("form-etiqueta").addEventListener("submit", agregarEtiqueta);
  cargarEtiquetas();
});
