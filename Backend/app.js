
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Bienvenido al backend!');
});


// Enlazar las rutas de usuarios
const rutaUsuarios = require('./routes/usuarios');
app.use('/usuarios', rutaUsuarios);

//Publicaciones rutas
const rutaPublicaciones = require('./routes/publicaciones');
app.use('/publicaciones', rutaPublicaciones);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
