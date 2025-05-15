const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken"); 
const etiquetaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true }
});

const Etiqueta = mongoose.model('Etiqueta', etiquetaSchema);

// GET (solo admin)
router.get('/', async (req, res) => {
  try {
    const etiquetas = await Etiqueta.find().sort({ nombre: 1 });
    res.json(etiquetas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener etiquetas' });
  }
});
// POST (solo admin)
router.post('/', async (req, res) => {
  const { nombre } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    if (decoded.rol !== "admin") {
      return res.status(403).json({ error: "Solo administradores pueden agregar etiquetas" });
    }

    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });

    const nueva = new Etiqueta({ nombre });
    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear etiqueta' });
  }
});

// DELETE (solo admin)
router.delete('/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    if (decoded.rol !== "admin") {
      return res.status(403).json({ error: "Solo administradores pueden eliminar etiquetas" });
    }
    const result = await Etiqueta.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Etiqueta no encontrada" });

    res.json({ mensaje: "Etiqueta eliminada" });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar etiqueta' });
  }
});

module.exports = router;