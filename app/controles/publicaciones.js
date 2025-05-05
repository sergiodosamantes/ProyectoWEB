const express = require('express');
const router = express.Router();

let publicaciones = [];
let comentarios = [];
let contador = 1;
let idComentario = 1;

// Crear nueva publicación
router.post('/', (req, res) => {
  const { titulo, contenido, autorId, etiquetas = [] } = req.body;

  if (!titulo || !contenido || !autorId) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const nuevaPublicacion = {
    id: contador++,
    titulo,
    contenido,
    autorId,
    etiquetas,
    fecha: new Date(),
    votosPositivos: 0,
    votosNegativos: 0,
  };

  publicaciones.push(nuevaPublicacion);
  res.status(201).json({ mensaje: 'Publicación creada', publicacion: nuevaPublicacion });
});

// Obtener publicaciones
router.get('/', (req, res) => {
  const { autorId } = req.query;
  if (autorId) {
    return res.json(publicaciones.filter(p => p.autorId == autorId));
  }
  res.json(publicaciones);
});

// Obtener publicación por ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const publicacion = publicaciones.find(p => p.id === id);
  if (!publicacion) {
    return res.status(404).json({ mensaje: 'Publicación no encontrada' });
  }
  res.json(publicacion);
});

// Editar publicación
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, contenido, autorId, etiquetas, resuelto } = req.body;

  const publicacion = publicaciones.find(p => p.id === id);
  if (!publicacion) return res.status(404).json({ mensaje: 'No encontrada' });
  if (publicacion.autorId != autorId) return res.status(403).json({ mensaje: 'Sin permiso' });

  if (titulo) publicacion.titulo = titulo;
  if (contenido) publicacion.contenido = contenido;
  if (etiquetas) publicacion.etiquetas = etiquetas;
  if (resuelto !== undefined) publicacion.resuelto = resuelto;

  res.json({ mensaje: 'Actualizada', publicacion });
});

// Eliminar publicación
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { autorId } = req.body;

  const index = publicaciones.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ mensaje: 'No encontrada' });
  if (publicaciones[index].autorId != autorId) return res.status(403).json({ mensaje: 'Sin permiso' });

  publicaciones.splice(index, 1);
  res.json({ mensaje: 'Eliminada' });
});

// Votar
router.post('/:id/votar', (req, res) => {
  const id = parseInt(req.params.id);
  const { tipo, tipoAnterior } = req.body;

  const pub = publicaciones.find(p => p.id === id);
  if (!pub) return res.status(404).json({ error: 'Publicación no encontrada' });

  if (tipoAnterior === 'up') pub.votosPositivos = Math.max(0, pub.votosPositivos - 1);
  if (tipoAnterior === 'down') pub.votosNegativos = Math.max(0, pub.votosNegativos - 1);

  if (tipo === 'up') pub.votosPositivos++;
  else if (tipo === 'down') pub.votosNegativos++;
  else return res.status(400).json({ error: 'Tipo inválido' });

  res.json({
    votosPositivos: pub.votosPositivos,
    votosNegativos: pub.votosNegativos
  });
});

// Comentarios

// GET comentarios por publicación
router.get('/:id/comentarios', (req, res) => {
  const pubId = parseInt(req.params.id);
  const filtrados = comentarios.filter(c => c.pubId === pubId);
  res.json(filtrados);
});

// POST agregar comentario
router.post('/:id/comentarios', (req, res) => {
  const pubId = parseInt(req.params.id);
  const { contenido, autorId, autorNombre, fecha } = req.body;

  if (!contenido || !autorId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const nuevoComentario = {
    id: idComentario++,
    pubId,
    contenido,
    autorId,
    autorNombre,
    fecha: fecha || new Date().toISOString()
  };

  comentarios.push(nuevoComentario);
  res.status(201).json({ mensaje: 'Comentario agregado', comentario: nuevoComentario });
});

module.exports = router;
