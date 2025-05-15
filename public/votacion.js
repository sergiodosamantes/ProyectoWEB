async function prepararVotacion(pubId, usuario) {
  const votosRes = await fetch(`/publicaciones/${pubId}/votos`);
  const votos = await votosRes.json();
  document.querySelector(".vote-count-up").textContent = votos.votosPositivos;
  document.querySelector(".vote-count-down").textContent = votos.votosNegativos;
  // ver si hay votos actuales
  const votoRes = await fetch(`/publicaciones/${pubId}/voto/${usuario.id}`);
  const voto = await votoRes.json();
  if (voto?.tipo === "up") document.querySelector(".btn-vote.up").classList.add("active");
  if (voto?.tipo === "down") document.querySelector(".btn-vote.down").classList.add("active");

  document.querySelector(".btn-vote.up").addEventListener("click", () => votar(pubId, "up", usuario.id));
  document.querySelector(".btn-vote.down").addEventListener("click", () => votar(pubId, "down", usuario.id));
}
 // ver si el user ya votó 
async function votar(id, tipo, userId) {
  const check = await fetch(`/publicaciones/${id}/voto/${userId}`);
  const voto = await check.json();
  if (voto?.tipo === tipo) return alert("Ya votaste esto.");
  // Si no ha votado enviar el voto 
  const res = await fetch(`/publicaciones/${id}/votar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo, usuarioId: userId })
  });

  const data = await res.json();
  if (!res.ok) return alert(data.error || "Error al votar");
// Actualiza el conteo de votos
  document.querySelector(".vote-count-up").textContent = data.votosPositivos;
  document.querySelector(".vote-count-down").textContent = data.votosNegativos;
// Mostrat solo el boton seleccionado
  document.querySelectorAll(".btn-vote").forEach(btn => btn.classList.remove("active"));
  document.querySelector(`.btn-vote.${tipo}`).classList.add("active");
}
