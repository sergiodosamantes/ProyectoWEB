
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Bienvenido al backend!');
});

// Aquí irán tus otras rutas: usuarios, publicaciones, etc.

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
