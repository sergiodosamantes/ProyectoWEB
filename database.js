
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://adminuser:admin123@proyecto.awsmpuw.mongodb.net/test_local?retryWrites=true&w=majority&appName=Proyecto'
    );
  } catch (error) {
    console.error('Error al conectar a MongoDB', error);
    process.exit(1);
  }
};

module.exports = connectDB;