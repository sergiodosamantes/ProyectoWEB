const express = require('express');
const router = express.Router();
const Usuario = require('./Usuario'); 

// POST /usuarios - Registrar nuevo usuario
router.post('/', async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const nuevoUsuario = new Usuario({ nombre, apellido, email, password });
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// POST /usuarios/login - Iniciar sesión (autenticación simple)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email, password });

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// DELETE /usuarios/logout - Simulado
router.delete('/logout', (req, res) => {
  // Como no usamos sesiones ni JWT todavía, solo respondimos algo simple
  res.json({ mensaje: 'Sesión cerrada (simulado)' });
});

module.exports = router;
