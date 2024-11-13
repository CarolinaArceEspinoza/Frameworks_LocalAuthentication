// models/category.js
import mongoose from 'mongoose';

// Schema 
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  ages: { type: String, required: true }
});

// Create mongoose schema
const Category = mongoose.model('Category', categorySchema);
export default Category;
