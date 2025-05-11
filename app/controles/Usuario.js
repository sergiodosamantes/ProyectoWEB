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
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);

