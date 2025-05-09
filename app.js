"use strict";

const express = require('express');
const app = express();
const PORT = 3000;
const path = require("path");
const connectDB = require('./database');

connectDB(); // Conectar a la base de datos

// Firma para JWT u otros usos
process.env.TOKEN_KEY = "ProyectoWeb2025";

// Middleware
app.use(express.json());
// Middleware para servir archivos estáticos (CSS, JS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('¡Bienvenido al backend!');
});

// Rutas de usuarios

const rutaUsuarios = require('./app/controles/usuarios');
app.use('/usuarios', rutaUsuarios);



// Rutas de publicaciones

const rutaPublicaciones = require('./app/controles/publicaciones');
app.use('/publicaciones', rutaPublicaciones);



// Rutas para servir archivos HTML
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "app/views/login.html"));
});
app.get('/feed', (req, res) => {
  res.sendFile(path.join(viewsPath, 'feed.html'));
});
app.get('/post', (req, res) => {
  res.sendFile(path.join(viewsPath, 'create_post.html'));
});
app.get('/detail', (req, res) => {
  res.sendFile(path.join(viewsPath, 'post_detail.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(viewsPath, 'register.html'));
});
app.get('/perfil', (req, res) => {
  res.sendFile(path.join(viewsPath, 'profile.html'));
});

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('¡Bienvenido al backend!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);

  console.log(`Servidor escuchando en http://localhost:${PORT}/feed`);
  console.log(`Servidor escuchando en http://localhost:${PORT}/login`);
});
