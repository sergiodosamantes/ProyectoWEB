// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    // Obtiene el formulario del DOM
    const form = document.querySelector("form");
  
    // event listener para el submit del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
    
        // Obtiene el usuario del localStorage (si está logueado)
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        
        // Si no hay usuario logueado, muestra alerta y redirige a login
        if (!usuario) {
            alert("Debes iniciar sesión para publicar.");
            window.location.href = "/login";
            return;
        }
    
        // Obtiene y limpia los valores del formulario
        const titulo = document.getElementById("title").value.trim();
        const contenido = document.getElementById("content").value.trim();
        const etiquetasTexto = document.getElementById("tags").value.trim();
        const archivo = document.getElementById("attachment").files[0]; // Archivo adjunto (no se ha implementado)
    
        // Valida que título y contenido no estén vacíos
        if (!titulo || !contenido) {
            alert("Título y contenido son obligatorios.");
            return;
        }
    
        // Crea el objeto de la nueva publicación
        const nuevaPublicacion = {
            titulo,
            contenido,
            autorId: usuario.id, // ID del usuario obtenido del localStorage
            etiquetas: etiquetasTexto ? etiquetasTexto.split(",").map(e => e.trim()) : [], // Convierte el texto de etiquetas en array
            fecha: new Date().toISOString(), 
            votos: 0, // Inicializa los votos en 0
            resuelto: false 
        };
    
        try {
            // Envía la nueva publicación al servidor
            const res = await fetch("/publicaciones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevaPublicacion)
            });
            const data = await res.json();
        
            // Si hay un error en la respuesta, muestra alerta
            if (!res.ok) {
                alert(data.error || "No se pudo crear la publicación.");
                return;
            }
        
            // Si todo sale bien, muestra confirmación y redirige al feed
            alert("¡Publicación creada con éxito!");
            window.location.href = "/feed";
        } catch (error) {
            // Muestra errores de conexión
            console.error("Error al crear publicación:", error);
            alert("Error al conectar con el servidor.");
        }
    });
});