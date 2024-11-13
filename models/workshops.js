// Import mongoose
import mongoose from 'mongoose';

// Schema 
const dataSchemaObj = {
  name: { type: String, required: true },
  dueDate: { type: Date },
  category: { type: String, required: true },
  support: { type: String, default: "NO NEEDED" },
};

// Create mongoose schema
const projectsSchema = mongoose.Schema(dataSchemaObj);
const Workshop = mongoose.model("Workshop", projectsSchema);

export default Workshop;
