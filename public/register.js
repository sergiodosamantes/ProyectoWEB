document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault(); // 

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirm = document.getElementById("confirm-password").value.trim();

    if (password !== confirm) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      const res = await fetch("/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al registrar");
        return;
      }

      alert("Registro exitoso. Redirigiendo a login...");
      window.location.href = "/login";

    } catch (err) {
      console.error("Error:", err);
      alert("Error en el registro");
    }
  });
});
