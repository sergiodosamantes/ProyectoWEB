"use strict";

// Redirección a la página de login
function goLogin() {
    window.location.href = "/login";
}

// Redirección a la página de feed (foro)
function goFeed() {
    window.location.href = "/feed";
}

// Redirección a la página de crear publicación
function goPost() {
    window.location.href = "/post";
}

// Redirección a la página de detalle de publicación
function goDetail() {
    window.location.href = "/detail";
}

// Redirección a la página de registro
function goRegister() {
    window.location.href = "/register";
}

function goPerfil() {
    window.location.href = "/perfil";
}

// Guarda los datos del usuario en localStorage (como JSON)
function guardarUsuario(usuario) {
    localStorage.setItem("usuario", JSON.stringify(usuario));
  }  
  // Obtiene y devuelve los datos del usuario almacenados en localStorage

  function obtenerUsuario() {
    return JSON.parse(localStorage.getItem("usuario"));
  }
  
  function cerrarSesion() {
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  }
  // Verifica si el usuario actual tiene privilegios de administrador

  function esAdmin() {
    const usuario = obtenerUsuario();
    return usuario && (usuario.rol === "Administrador R" || usuario.rol === "Administrador N");
  }
