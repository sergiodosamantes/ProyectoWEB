"use strict";

const express = require('express');
const app = express();
const PORT = 3000;
const path = require("path");
const connectDB = require('./database');

connectDB(); // Conectar a la base de datos



// Middleware para parsear JSON
app.use(express.json());

// Middleware para servir archivos estáticos (CSS, JS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('¡Bienvenido al backend!');
});

// Rutas de usuarios

const rutaUsuarios = require('./app/controles/usuarios');
app.use('./app/controles/usuarios.js', rutaUsuarios);



// Rutas de publicaciones

const rutaPublicaciones = require('./app/controles/publicaciones');
app.use('/publicaciones', rutaPublicaciones);



// Rutas para servir archivos HTML
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "app/views/login.html"));
});

app.get('/feed', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/views/feed.html'));
});

app.get('/post', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/views/create_post.html'));
});

app.get('/detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/views/post_detail.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/views/register.html'));
});

app.get('/perfil', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/views/profile.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);

  console.log(`Servidor escuchando en http://localhost:${PORT}/feed`);
  console.log(`Servidor escuchando en http://localhost:${PORT}/login`);
});
