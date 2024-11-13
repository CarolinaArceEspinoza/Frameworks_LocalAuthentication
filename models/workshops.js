// Naming convention for models: use singular form of the represented entity
// Import mongoose
import mongoose from 'mongoose';

// Define data schema (JSON)
const dataSchemaObj = {
  name: { type: String, required: true },
  dueDate: { type: Date },
  category: { type: String, required: true },
  support: { type: String, default: "NO NEEDED" },
};

// Create mongoose schema
const projectsSchema = mongoose.Schema(dataSchemaObj);

// Create and export mongoose model using ES Modules export syntax
const Workshop = mongoose.model("Workshop", projectsSchema);

export default Workshop;
