const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Esquema para Publicaciones
const publicacionSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  contenido: { type: String, required: true },
  autorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  etiquetas: [String],
  fecha: { type: Date, default: Date.now },
  resuelto: { type: Boolean, default: false }
});
const Publicacion = mongoose.model('Publicacion', publicacionSchema);

// Esquema para Comentarios
const comentarioSchema = new mongoose.Schema({
  pubId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Publicacion' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comentario', default: null }, // <- AÑADE ESTO
  contenido: { type: String, required: true },
  autorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  autorNombre: { type: String },
  fecha: { type: Date, default: Date.now }
});
const Comentario = mongoose.model('Comentario', comentarioSchema);

// Esquema para Votos de Publicaciones
const votoSchema = new mongoose.Schema({
  publicacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publicacion', required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo: { type: String, enum: ['up', 'down'], required: true }
});
const Voto = mongoose.model('Voto', votoSchema);

//  Esquema para Votos de Comentarios
const votoComentarioSchema = new mongoose.Schema({
  comentarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comentario', required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo: { type: String, enum: ['up', 'down'], required: true }
});
const VotoComentario = mongoose.model('VotoComentario', votoComentarioSchema);

// Crear nueva publicación
router.post('/', async (req, res) => {
  const { titulo, contenido, autorId, etiquetas = [] } = req.body;

  if (!titulo || !contenido || !autorId) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const nueva = new Publicacion({ titulo, contenido, autorId, etiquetas });
    await nueva.save();
    res.status(201).json({ mensaje: 'Publicación creada', publicacion: nueva });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear publicación' });
  }
});

// Obtener publicaciones
router.get('/', async (req, res) => {
  const { autorId } = req.query;
  try {
    const filtro = autorId ? { autorId } : {};
    const publicaciones = await Publicacion.find(filtro).sort({ fecha: -1 });
    res.json(publicaciones);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
});

// Obtener publicación por ID
router.get('/:id', async (req, res) => {
  try {
    const pub = await Publicacion.findById(req.params.id);
    if (!pub) return res.status(404).json({ mensaje: 'No encontrada' });
    res.json(pub);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener publicación' });
  }
});

// Obtener voto de un usuario en una publicación
router.get('/:id/voto/:usuarioId', async (req, res) => {
  try {
    const voto = await Voto.findOne({
      publicacionId: req.params.id,
      usuarioId: req.params.usuarioId
    });
    res.json(voto || null);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener voto' });
  }
});

// Obtener conteo de votos por publicación
router.get('/:id/votos', async (req, res) => {
  try {
    const publicacionId = req.params.id;
    const votosPositivos = await Voto.countDocuments({ publicacionId, tipo: 'up' });
    const votosNegativos = await Voto.countDocuments({ publicacionId, tipo: 'down' });
    res.json({ votosPositivos, votosNegativos });
  } catch (err) {
    res.status(500).json({ error: 'Error al contar votos' });
  }
});

// Actualizar publicación
router.put('/:id', async (req, res) => {
  const { titulo, contenido, autorId, etiquetas, resuelto } = req.body;

  try {
    const pub = await Publicacion.findById(req.params.id);
    if (!pub) return res.status(404).json({ mensaje: 'No encontrada' });
    if (pub.autorId.toString() !== autorId) return res.status(403).json({ mensaje: 'Sin permiso' });

    pub.titulo = titulo ?? pub.titulo;
    pub.contenido = contenido ?? pub.contenido;
    pub.etiquetas = etiquetas ?? pub.etiquetas;
    if (resuelto !== undefined) pub.resuelto = resuelto;

    await pub.save();
    res.json({ mensaje: 'Actualizada', publicacion: pub });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar' });
  }
});

// Eliminar publicación + votos + comentarios
router.delete('/:id', async (req, res) => {
  const { autorId } = req.body;
  try {
    const pub = await Publicacion.findById(req.params.id);
    if (!pub) return res.status(404).json({ mensaje: 'No encontrada' });

    const usuario = await Usuario.findById(autorId);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    // Permitir si es autor o admin
    if (pub.autorId.toString() !== autorId && usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Sin permiso' });
    }

    await Voto.deleteMany({ publicacionId: pub._id });
    await Comentario.deleteMany({ pubId: pub._id });
    await pub.deleteOne();

    res.json({ mensaje: 'Publicación eliminada' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar' });
  }
});

// Votar publicación
router.post('/:id/votar', async (req, res) => {
  const publicacionId = req.params.id;
  const { tipo, usuarioId } = req.body;

  if (!['up', 'down'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de voto inválido' });
  }

  try {
    const votoExistente = await Voto.findOne({ publicacionId, usuarioId });

    if (votoExistente) {
      if (votoExistente.tipo === tipo) {
        return res.status(400).json({ error: 'Ya votaste lo mismo' });
      }
      votoExistente.tipo = tipo;
      await votoExistente.save();
    } else {
      const nuevoVoto = new Voto({ publicacionId, usuarioId, tipo });
      await nuevoVoto.save();
    }

    const votosUp = await Voto.countDocuments({ publicacionId, tipo: 'up' });
    const votosDown = await Voto.countDocuments({ publicacionId, tipo: 'down' });

    res.json({ votosPositivos: votosUp, votosNegativos: votosDown });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar el voto' });
  }
});

// Obtener comentarios
router.get('/:id/comentarios', async (req, res) => {
  try {
    const comentarios = await Comentario.find({ pubId: req.params.id }).sort({ fecha: 1 });
    res.json(comentarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

// Agregar comentario
router.post('/:id/comentarios', async (req, res) => {
  const { contenido, autorId, autorNombre, parentId = null } = req.body;

  if (!contenido || !autorId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const nuevoComentario = new Comentario({
      pubId: req.params.id,
      contenido,
      autorId,
      autorNombre,
      parentId
    });
    await nuevoComentario.save();
    res.status(201).json({ mensaje: 'Comentario agregado', comentario: nuevoComentario });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el comentario' });
  }
});
// Obtener votos de un comentario
router.get('/comentarios/:id/voto/:usuarioId', async (req, res) => {
  try {
    const { id, usuarioId } = req.params;
    const voto = await VotoComentario.findOne({ comentarioId: id, usuarioId });
    res.json(voto || null);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener voto del comentario' });
  }
});
// Votar en un comentario
router.post('/comentarios/:id/votar', async (req, res) => {
  const comentarioId = req.params.id;
  const { tipo, usuarioId } = req.body;

  if (!['up', 'down'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de voto inválido' });
  }

  try {
    let voto = await VotoComentario.findOne({ comentarioId, usuarioId });

    if (voto) {
      if (voto.tipo === tipo) {
        return res.status(400).json({ error: 'Ya votaste lo mismo' });
      }
      voto.tipo = tipo;
      await voto.save();
    } else {
      voto = new VotoComentario({ comentarioId, usuarioId, tipo });
      await voto.save();
    }

    const votosPositivos = await VotoComentario.countDocuments({ comentarioId, tipo: 'up' });
    const votosNegativos = await VotoComentario.countDocuments({ comentarioId, tipo: 'down' });

    res.json({ votosPositivos, votosNegativos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar el voto en comentario' });
  }
});
//  Eliminar un comentario (autor)
router.delete('/comentarios/:id', async (req, res) => {
  const { usuarioId } = req.body;

  try {
    const comentario = await Comentario.findById(req.params.id);
    if (!comentario) return res.status(404).json({ error: 'Comentario no encontrado' });

    if (comentario.autorId.toString() !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este comentario' });
    }

    await VotoComentario.deleteMany({ comentarioId: comentario._id }); // Borra votos del comentario
    await comentario.deleteOne();

    res.json({ mensaje: 'Comentario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el comentario' });
  }
});
// Editar un comentario (solo el autor puede hacerlo)
router.put('/comentarios/:id', async (req, res) => {
  const { contenido, usuarioId } = req.body;

  if (!contenido || !usuarioId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const comentario = await Comentario.findById(req.params.id);
    if (!comentario) return res.status(404).json({ error: 'Comentario no encontrado' });

    if (comentario.autorId.toString() !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso para editar este comentario' });
    }

    comentario.contenido = contenido;
    await comentario.save();

    res.json({ mensaje: 'Comentario editado correctamente', comentario });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar el comentario' });
  }
});

// Obtener conteo de votos de un comentario
router.get('/comentarios/:id/votos', async (req, res) => {
  try {
    const comentarioId = req.params.id;
    const votosPositivos = await VotoComentario.countDocuments({ comentarioId, tipo: 'up' });
    const votosNegativos = await VotoComentario.countDocuments({ comentarioId, tipo: 'down' });
    res.json({ votosPositivos, votosNegativos });
  } catch (err) {
    res.status(500).json({ error: 'Error al contar votos del comentario' });
  }
});

module.exports = router;
