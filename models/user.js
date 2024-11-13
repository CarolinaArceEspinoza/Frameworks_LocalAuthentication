import mongoose from 'mongoose';  // Usar import
import plm from 'passport-local-mongoose';  // Usar import

const dataSchemaObj = {
    username: { type: String },
    password: { type: String },
    oauthId: { type: String },
    oauthProvider: { type: String },
    created: { type: Date },
};

const userSchema = new mongoose.Schema(dataSchemaObj);
userSchema.plugin(plm);

// Exportar el modelo como default
export default mongoose.model('User', userSchema);
