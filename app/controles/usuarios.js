const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('./Usuario');
const bcrypt = require('bcryptjs');

// POST /usuarios - Registrar nuevo usuario
router.post('/', async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Encriptar la contraseña antes de guardar
    const hashedPassword = bcrypt.hashSync(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      email,
      password: hashedPassword
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});
// POST /usuarios/login - 
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Comparar contraseña en texto plano con la encriptada
    const esValida = bcrypt.compareSync(password, usuario.password);

    if (!esValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        nombre: usuario.nombre,
        rol: usuario.rol
      },
      process.env.TOKEN_KEY,
      { expiresIn: '2h' }
    );

    res.json({ mensaje: 'Inicio de sesión exitoso', token });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// DELETE /usuarios/logout - Simulado
router.delete('/logout', (req, res) => {
  res.json({ mensaje: 'Sesión cerrada (simulado)' });
});

module.exports = router;
