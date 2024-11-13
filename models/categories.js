// models/category.js
import mongoose from 'mongoose';

// Definir el esquema para el modelo Category
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  ages: { type: String, required: true }
});

// Crear el modelo basado en el esquema
const Category = mongoose.model('Category', categorySchema);

// Exportar el modelo como default
export default Category;
