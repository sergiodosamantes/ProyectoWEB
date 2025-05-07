const express = require('express');
const router = express.Router();

let publicaciones = [];
let contador = 1; // para IDs

// POST /publicaciones - Crear nueva publicación
router.post('/', (req, res) => {
  const { titulo, contenido, autorId } = req.body;

  if (!titulo || !contenido || !autorId) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const nuevaPublicacion = {
    id: contador++,
    titulo,
    contenido,
    autorId
  };

  publicaciones.push(nuevaPublicacion);
  res.status(201).json({ mensaje: 'Publicación creada', publicacion: nuevaPublicacion });
});

// GET /publicaciones - Obtener todas las publicaciones (puedes filtrar por autorId)
router.get('/', (req, res) => {
  const { autorId } = req.query;

  if (autorId) {
    const filtradas = publicaciones.filter(p => p.autorId == autorId);
    return res.json(filtradas);
  }

  res.json(publicaciones);
});

// GET /publicaciones/:id - Obtener publicación por ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const publicacion = publicaciones.find(p => p.id === id);

  if (!publicacion) {
    return res.status(404).json({ mensaje: 'Publicación no encontrada' });
  }

  res.json(publicacion);
});

// PUT /publicaciones/:id - Editar publicación 
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, contenido, autorId } = req.body;

  const publicacion = publicaciones.find(p => p.id === id);

  if (!publicacion) {
    return res.status(404).json({ mensaje: 'Publicación no encontrada' });
  }

  if (publicacion.autorId != autorId) {
    return res.status(403).json({ mensaje: 'No tienes permiso para editar esta publicación' });
  }

  if (titulo) publicacion.titulo = titulo;
  if (contenido) publicacion.contenido = contenido;

  res.json({ mensaje: 'Publicación actualizada', publicacion });
});

module.exports = router;
