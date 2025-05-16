"use strict";
// mostrar publicaciones o comentarios en app/views/admin_reports.html que esten reportados
// cuando se reporta un comentario o publicacion debe que salir la informacion de que lo creo la publicacion como tal y los comentarios de los reportes
// botones para editar, borar y resolver
// delate publicacion, abrir modal de editar publicacion y borrar la publicacion de reporte y cambiar a reportado por false

// Mostrar publicaciones reportadas y sus reportes
document.addEventListener("DOMContentLoaded", async () => {
    const usuario = obtenerUsuarioToken();
    if (!usuario || usuario.rol !== "admin") {
        alert("Acceso restringido solo para administradores.");
        goLogin();
        return;
    }

    const params = new URLSearchParams(location.search);
    const pubId = params.get("id");

    if (pubId) {
        // Mostrar detalle de la publicación reportada
        try {
            const [pubRes, reportesRes] = await Promise.all([
                fetch(`/publicaciones/${pubId}`),
                fetch(`/publicaciones/reportes/${pubId}`)
            ]);

            if (!pubRes.ok || !reportesRes.ok)
                throw new Error("Error al obtener datos");

            const pub = await pubRes.json();
            const reportes = await reportesRes.json();

            await prepararModalEdicion(pub, usuario); // robado de post detail
            mostrarAdminHTML(pub, reportes, usuario);
            prepararVotacion(pubId, usuario);
            await cargarComentarios(pubId, usuario);
            prepararComentarioNuevo(pubId, usuario);
        } catch (err) {
            console.error(err);
            document.getElementById("detalle-publicacion").innerHTML = "<p class='text-danger'>Error cargando datos.</p>";
        }
    }
    else {
        //Mostrar tabla con publicaciones reportadas
        const contenedor = document.getElementById("detalle-publicacion");
        try {
            const res = await fetch("/publicaciones/reportadas");
            if (!res.ok) throw new Error("Error al obtener publicaciones reportadas");

            const publicaciones = await res.json();

            if (publicaciones.length === 0) {
                contenedor.innerHTML = "<p class='text-muted'>No hay publicaciones reportadas.</p>";
                return;
            }

            let html = `
        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
      `;

            for (const pub of publicaciones) {
                const autorRes = await fetch(`/usuarios/${pub.autorId}`);
                const autor = autorRes.ok ? await autorRes.json() : { nombre: "Desconocido" };

                html += `
          <tr>
            <td>${pub.titulo}</td>
            <td>${autor.nombre || "Anónimo"}</td>
            <td>${new Date(pub.fecha).toLocaleString()}</td>
            <td>
              <a href="admin_reports.html?id=${pub._id}" class="btn btn-sm btn-primary">Ver detalle</a>
            </td>
          </tr>
        `;
            }

            html += `
            </tbody>
          </table>
        </div>
      `;

            contenedor.innerHTML = html;
        } catch (err) {
            console.error(err);
            contenedor.innerHTML = "<p class='text-danger'>Error al cargar publicaciones reportadas.</p>";
        }
    }
});
