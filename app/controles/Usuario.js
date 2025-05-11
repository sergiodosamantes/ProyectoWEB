const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true 
  },
  apellido: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  rol: { 
    type: String, 
    enum: ['usuario', 'admin'],
    default: 'usuario' 
  },
  imagenURL: { 
    type: String,
    default: 'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.webp'

  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);

