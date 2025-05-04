const express = require('express');
const router = express.Router();

let usuarios = [];
let usuarioLogueado = null; // Aquí simulamos la sesión

// POST /usuarios - Registrar un nuevo usuario
router.post('/', (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const nuevoUsuario = {
    id: usuarios.length + 1,
    nombre,
    apellido,
    email,
    password,
    rol: 'usuario' // Por defecto
  };

  usuarios.push(nuevoUsuario);
  res.status(201).json({ mensaje: 'Usuario registrado', usuario: nuevoUsuario });
});

// POST /usuarios/login - Iniciar sesión
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const usuario = usuarios.find(u => u.email === email && u.password === password);

  if (!usuario) {
    return res.status(401).json({ mensaje: 'Credenciales inválidas' });
  }

  usuarioLogueado = usuario; // Guardamos al usuario en memoria

  res.json({
    mensaje: 'Inicio de sesión exitoso',
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    }
  });
});

// DELETE /usuarios/logout - Cerrar sesión
router.delete('/logout', (req, res) => {
  if (usuarioLogueado) {
    usuarioLogueado = null;
    res.json({ mensaje: 'Sesión cerrada correctamente' });
  } else {
    res.status(400).json({ mensaje: 'No hay sesión activa' });
  }
});

module.exports = router;
