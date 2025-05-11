document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.mensaje || "Credenciales inválidas");
        return;
      }

      sessionStorage.setItem("token", data.token);

      alert("Inicio de sesión exitoso");
      window.location.href = "/feed";
    } catch (err) {
      console.error("Error:", err);
      alert("Error al conectar con el servidor");
    }
  });
});
